<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\evolution\backend\game\PropertyBehavior\PropertyBehavior;

class Property
{
    private int $id;
    private Creature $creature;
    private int $type;
    private array $currentFood;
    private bool $isPaused;
    private int $isStopped;
    private PropertyBehavior $behavior;
    private ?Property $relProperty;
    private int $asymm;
    private bool $isAvatar;

    public function __construct(Creature $creature, int $type, int $id)
    {
        $this->id = $id;
        $this->creature = $creature;
        $this->type = $type;

        $this->currentFood = [];
        $this->isPaused = false;
        $this->isStopped = 0;

        $this->behavior = PropertyBehavior::create($this);
        $this->relProperty = null;
        $this->asymm = 0;
        $this->isAvatar = false;
    }

    public function toArray(): array
    {
        return [
            'propertyId' => $this->getId(),
            'creatureId' => $this->getCreature()->getId(),
            'type' => $this->type,
            'currentFood' => $this->currentFood,
            'isPaused' => $this->isPaused,
            'isStopped' => $this->isStopped,
            'relProperty' => $this->relProperty ? $this->relProperty->getId() : null,
            'asymm' => $this->asymm,
            'isAvatar' => $this->isAvatar,
        ];
    }

    public function init(array $config): void
    {
        $this->currentFood = $config['currentFood'];
        $this->isPaused = $config['isPaused'];
        $this->isStopped = $config['isStopped'];
        if ($config['relProperty']) {
            $relProperty = $this->getGame()->getProperty($config['relProperty']);
            if ($relProperty) {
                $this->setRelation($relProperty);
                $relProperty->setRelation($this);
            }
        }
        $this->asymm = $config['asymm'];
        $this->isAvatar = $config['isAvatar'];
    }

    public static function bindPareProperties(Property $property1, Property $property2): ?array
    {
        if ($property1->getType() != $property2->getType()) {
            return null;
        }

        $property1->setRelation($property2);
        $property2->setRelation($property1);
        $property2->setAvatar();
        
        if (PropertyBank::isSymmetric($property1->getType())) {
            return [];
        }

        $property1->setAsymm(0);
        $property2->setAsymm(1);
        return [0, 1];
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getType(): int
    {
        return $this->type;
    }

    public function getName(): string
    {
        return PropertyBank::getName($this->type);
    }

    public function isAvailable(): bool
    {
        return !$this->isPaused && ($this->isStopped == 0);
    }

    public function setAvatar(): void
    {
        $this->isAvatar = true;
    }

    public function setAsymm(int $asymm): void
    {
        $this->asymm = $asymm;
    }

    public function getAsymm(): int
    {
        return $this->asymm;
    }

    public function getGame(): Game
    {
        return $this->getGamer()->getGame();
    }

    public function getGamer(): Gamer
    {
        return $this->creature->getGamer();
    }

    public function getCreature(): Creature
    {
        return $this->creature;
    }

    public function getBehavior(): PropertyBehavior
    {
        return $this->behavior;
    }

    public function is(int $type): bool
    {
        return $this->type == $type;
    }

    public function setPaused(bool $value = true): void
    {
        $this->isPaused = $value;
    }

    public function isPaused(): bool
    {
        return $this->isPaused;
    }

    public function setStopped(int $turns = 1): void
    {
        $this->isStopped = $turns;
    }

    public function getStopped(): int
    {
        return $this->isStopped;
    }

    public function hasActivity(): bool
    {
        return $this->behavior->hasActivity();
    }

    public function hasPotentialActivity(): bool
    {
        return $this->behavior->hasPotentialActivity();
    }

    public function getNeedFood(): int
    {
        return PropertyBank::getNeedFood($this->type);
    }

    public function getEatenFood(): int
    {
        if ($this->is(PropertyBank::FAT)) {
            return 0;
        }

        return count($this->currentFood);
    }

    public function hasFat(): bool
    {
        if ($this->is(PropertyBank::FAT)) {
            return count($this->currentFood) > 0;
        }

        return false;
    }

    public function eat(string $foodType): void
    {
        $this->currentFood[] = $foodType;
    }

    public function loseFood(): bool
    {
        if (count($this->currentFood) < 1) {
            return false;
        }

        array_pop($this->currentFood);
        return true;
    }

    public function setRelation(Property $relProperty): void
    {
        $this->relProperty = $relProperty;
    }

    public function getRelatedProperty(): ?Property
    {
        return $this->relProperty;
    }

    public function getRelatedCreature(): ?Creature
    {
        if (!$this->relProperty) {
            return null;
        }

        return $this->relProperty->getCreature();
    }

    public function prepareToFeedTurn(): void
    {
        $this->isPaused = false;
    }

    public function onFeedPhaseFinished(): array
    {
        if ($this->is(PropertyBank::FAT)) {
            return [];
        }

        $this->currentFood = [];

        $this->isPaused = false;
        $map = [];
        if ($this->isStopped > 0) {
            $this->isStopped--;
            $map[] = 'isStopped';
        }
        
        return $this->behavior->getStateReport($map);
    }

    public function onFeed(string $foodType): ?array
    {
        return $this->behavior->onFeed($foodType);
    }

    /**
     * @param array $data
     * @return array|false
     */
    public function runAction($data = [])
    {
        $result = $this->behavior->run($data);
        if ($result !== false) {
            $key = $this->behavior->getLogKey();
            if ($key) {
                $this->getGame()->log($key, [
                    'name' => $this->getGamer()->getAuthField(),
                    'property' => $this->getName(),
                ]);
            }
        }

        return $result;
    }

    public function calcScore(): int
    {
        if ($this->isAvatar) {
            return 0;
        }

        return $this->getNeedFood() + 1;
    }
}
