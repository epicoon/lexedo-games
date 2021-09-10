<?php

namespace lexedo\games\evolution\backend\game;

class Creature
{
    const NEED_FOOD = 1;

    private int $id;
    private Gamer $gamer;
    /** @var array<Property> */
    private array $properties;
    private array $currentFood;
    private bool $isPoisoned;

    public function __construct(Gamer $gamer, int $id)
    {
        $this->id = $id;
        $this->gamer = $gamer;
        $this->properties = [];

        $this->currentFood = [];
        $this->isPoisoned = false;
    }
    
    public function toArray(): array
    {
        $properties = [];
        foreach ($this->properties as $property) {
            $properties[] = $property->getId();
        }
        return [
            'creatureId' => $this->getId(),
            'gamerId' => $this->getGamer()->getId(),
            'currentFood' => $this->currentFood,
            'isPoisoned' => $this->isPoisoned,
            'properties' => $properties,
        ];
    }
    
    public function init(array $config): void
    {
        $this->currentFood = $config['currentFood'] ?? [];
        $this->isPoisoned = $config['isPoisoned'] ?? false;
    }
    
    public function getId(): int
    {
        return $this->id;
    }

    public function getGame(): Game
    {
        return $this->gamer->getGame();
    }

    public function getGamer(): Gamer
    {
        return $this->gamer;
    }

    public function getCartCount(): int
    {
        return count($this->properties) + 1;
    }
    
    public function isPoisoned(): bool
    {
        return $this->isPoisoned;
    }

    public function mustDieOut(): bool
    {
        if ($this->isPoisoned()) {
            return true;
        }

        return $this->isUnderfed();
    }

    /**
     * @return array<Property>
     */
    public function getProperties(): array
    {
        return $this->properties;
    }

    /**
     * @return array<Property>
     */
    public function getPropertiesByType(int $type): array
    {
        $result = [];
        foreach ($this->properties as $property) {
            if ($property->is($type)) {
                $result[] = $property;
            }
        }
        return $result;
    }

    public function getPropertyById(int $id): ?Property
    {
        return $this->properties[$id] ?? null;
    }

    public function canAttachProperty(int $type): bool
    {
        if ($type == PropertyBank::SCAVENGER && $this->hasProperty(PropertyBank::CARNIVAL)) {
            return false;
        }

        if ($type == PropertyBank::CARNIVAL && $this->hasProperty(PropertyBank::SCAVENGER)) {
            return false;
        }

        if (PropertyBank::isSingle($type)) {
            return empty($this->getPropertiesByType($type));
        }

        return true;
    }

    public function hasRelation(Creature $creature, int $propertyType): bool
    {
        $props = $this->getPropertiesByType($propertyType);
        foreach ($props as $property) {
            if ($property->getRelatedCreature() === $creature) {
                return true;
            }
        }

        return false;
    }

    public function addProperty(Property $property): void
    {
        $this->properties[$property->getId()] = $property;
    }
    
    public function addNewProperty(int $propertyType): Property
    {
        $property = $this->getGame()->getNewProperty($this, $propertyType);
        $this->addProperty($property);
        return $property;
    }

    public function eat(string $foodType, int $eatCount = 1, bool $useFat = true, bool $useProperties = true): ?array
    {
        if ($eatCount > 1) {
            $result = $this->eat($foodType, 1, $useFat, $useProperties);
            if (!$result) {
                return null;
            }

            for ($i = 1; $i < $eatCount; $i++) {
                $report = $this->eat($foodType, 1, $useFat, false);
                if ($report) {
                    $result = array_merge($result, $report);
                }
            }
            return $result;
        }

        $eaten = false;
        $workFoodType = $foodType;
        $propertyId = 0;
        if (empty($this->currentFood)) {
            $this->currentFood[] = $workFoodType;
            $eaten = true;
        } else {
            foreach ($this->properties as $property) {
                if ($property->getEatenFood() < $property->getNeedFood()) {
                    $property->eat($workFoodType);
                    $propertyId = $property->getId();
                    $eaten = true;
                    break;
                }
            }
            if (!$eaten && $useFat) {
                foreach ($this->properties as $property) {
                    if ($property->is(PropertyBank::FAT) && !$property->hasFat()) {
                        $workFoodType = Game::FOOD_TYPE_FAT;
                        $property->eat($workFoodType);
                        $propertyId = $property->getId();
                        $eaten = true;
                    }
                }
            }
        }

        if ($eaten) {
            if ($foodType == Game::FOOD_TYPE_RED) {
                $this->getGame()->wasteFood();
            }
        } else {
            return null;
        }

        $feedReport = [
            'gamerId' => $this->getGamer()->getId(),
            'creatureId' => $this->getId(),
            'propertyId' => $propertyId,
            'foodType' => $workFoodType,
        ];

        $commonReport = [];
        if ($useProperties) {
            foreach ($this->properties as $property) {
                $report = $property->onFeed($foodType);
                if ($report) {
                    $feedReport['pareState'][] = $report['pareState'];
                    $commonReport = array_merge($commonReport, $report['feedReport']);
                }
            }
        }

        $commonReport = array_merge([$feedReport], $commonReport);

        return $commonReport;
    }

    /**
     * @return int [[propertyId]]
     */
    public function loseFood(): int
    {
        $prevProp = null;
        foreach ($this->properties as $property) {
            if ($property->getNeedFood()) {
                if ($property->getEatenFood() == 0) {
                    break;
                }

                $prevProp = $property;
            }
        }

        if ($prevProp === null) {
            array_pop($this->currentFood);
            $result = 0;
        } else {
            $prevProp->loseFood();
            $result = $prevProp->getId();
        }

        return $result;
    }

    public function isUnderfed(): bool
    {
        return ($this->getNeedFood() > 0);
    }

    public function getNeedFood(): int
    {
        return $this->getTotalNeedFood() - $this->getEatenFood();
    }

    public function getTotalNeedFood(): int
    {
        $result = self::NEED_FOOD;
        foreach ($this->properties as $property) {
            $result += $property->getNeedFood();
        }

        return $result;
    }

    public function getEatenFood(): int
    {
        $result = count($this->currentFood);
        foreach ($this->properties as $property) {
            $result += $property->getEatenFood();
        }

        return $result;
    }

    public function isHungry(): bool
    {
        if ($this->isUnderfed()) {
            return true;
        }

        return ($this->getCurrentFat() < $this->getTotalFat());
    }

    public function getCurrentFat(): int
    {
        $result = 0;
        foreach ($this->properties as $property) {
            if ($property->is(PropertyBank::FAT) && $property->hasFat()) {
                $result++;
            }
        }

        return $result;
    }

    public function getTotalFat(): int
    {
        $result = 0;
        foreach ($this->properties as $property) {
            if ($property->is(PropertyBank::FAT)) {
                $result++;
            }
        }

        return $result;
    }

    public function hasActivities(): bool
    {
        foreach ($this->properties as $property) {
            if ($property->hasActivity()) {
                return true;
            }
        }
        return false;
    }

    public function hasPotentialActivities(): bool
    {
        foreach ($this->properties as $property) {
            if ($property->hasPotentialActivity()) {
                return true;
            }
        }
        return false;
    }

    public function trySurvive(): void
    {
        //TODO
        /*
            - если существо сытое, ничего делать не надо
            - если голодное
                - если есть жир, и его достаточно, чтобы прокормиться, применяется жир. Выход
                - если есть спячка, активируется. Выход
        */
    }

    public function dropRelPropertiesOnDie(): array
    {
        $result = [];
        foreach ($this->properties as $property) {
            $relProp = $property->getRelatedProperty();
            if ($relProp) {
                $result[] = [
                    $relProp->getCreature()->getId(),
                    $relProp->getId(),
                ];
                $relProp->getCreature()->removeProperty($relProp);
            }
        }
        return $result;
    }

    public function dropProperty(Property $property): array
    {
        if (!$this->removeProperty($property)) {
            return [];
        }

        $this->getGamer()->incDroppingCounter();
        $result = [
            [$this->getGamer()->getId(), $this->getId(), $property->getId(), 1]
        ];

        $relProp = $property->getRelatedProperty();
        if ($relProp) {
            $result[] = [$relProp->getGamer()->getId(), $relProp->getCreature()->getId(), $relProp->getId(), 0];
            $relProp->getCreature()->removeProperty($relProp);
        }
        return $result;
    }

    public function removeProperty(Property $property): bool
    {
        if (!array_key_exists($property->getId(), $this->properties)) {
            return false;
        }

        unset($this->properties[$property->getId()]);
        $this->getGame()->dropProperty($property);
        return true;
    }

    public function prepareToFeedTurn(): void
    {
        foreach ($this->properties as $property) {
            $property->prepareToFeedTurn();
        }
    }

    public function onFeedPhaseFinished(): array
    {
        $this->currentFood = [];

        $result = [];
        foreach ($this->properties as $property) {
            $report = $property->onFeedPhaseFinished();
            if (!empty($report)) {
                $result[$property->getId()] =  $report;
            }
        }
        return $result;
    }

    public function calcScore(): int
    {
        $result = 2;
        foreach ($this->properties as $property) {
            $result += $property->calcScore();
        }
        return $result;
    }

    public function poison(): void
    {
        $this->isPoisoned = true;
    }

    public function isBig(): bool
    {
        return $this->hasProperty(PropertyBank::BIG);
    }

    public function isSwimming(): bool
    {
        return $this->hasProperty(PropertyBank::SWIM);
    }

    public function isHidden(): bool
    {
        return $this->hasProperty(PropertyBank::HIDE);
    }

    public function isAcute(): bool
    {
        return $this->hasProperty(PropertyBank::ACUTE);
    }

    public function isHole(): bool
    {
        return $this->hasProperty(PropertyBank::HOLE);
    }

    public function isSymbiont(): bool
    {
        foreach ($this->properties as $property) {
            if ($property->is(PropertyBank::SYMBIOSIS) && ($property->getAsymm() == 0)) {
                return true;
            }
        }

        return false;
    }

    public function hasProperty(int $type): bool
    {
        foreach ($this->properties as $property) {
            if ($property->is($type)) {
                return true;
            }
        }

        return false;
    }
}
