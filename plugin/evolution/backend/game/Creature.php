<?php

namespace lexedo\games\evolution\backend\game;

/**
 * Class Creature
 * @package lexedo\games\evolution\backend\game
 */
class Creature
{
    const NEED_FOOD = 1;

    private static $idCounter = 0;

    /** @var int */
    private $id;

    /** @var Gamer */
    private $gamer;

    /** @var Property[] */
    private $properties;

    /** @var int */
    private $currentFood;

    /** @var bool */
    private $isPoisoned;

    /**
     * Creature constructor.
     * @param Gamer $gamer
     */
    public function __construct($gamer)
    {
        $this->id = ++self::$idCounter;
        $this->gamer = $gamer;
        $this->properties = [];

        $this->currentFood = 0;
        $this->isPoisoned = false;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return Game
     */
    public function getGame()
    {
        return $this->gamer->getGame();
    }

    /**
     * @return Gamer
     */
    public function getGamer()
    {
        return $this->gamer;
    }

    /**
     * @return int
     */
    public function getCartCount()
    {
        return count($this->properties) + 1;
    }

    /**
     * @return bool
     */
    public function isPoisoned()
    {
        return $this->isPoisoned;
    }

    /**
     * @return bool
     */
    public function mustDieOut()
    {
        if ($this->isPoisoned()) {
            return true;
        }

        return $this->isUnderfed();
    }

    /**
     * @return Property[]
     */
    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * @param int $type
     * @return Property[]
     */
    public function getPropertiesByType($type)
    {
        $result = [];
        foreach ($this->properties as $property) {
            if ($property->is($type)) {
                $result[] = $property;
            }
        }
        return $result;
    }

    /**
     * @param int $id
     * @return Property|null
     */
    public function getPropertyById($id)
    {
        return $this->properties[$id] ?? null;
    }

    /**
     * @param int $type
     * @return bool
     */
    public function canAttachProperty($type)
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

    /**
     * @param Creature $creature
     * @param int $propertyType
     */
    public function hasRelation($creature, $propertyType)
    {
        $props = $this->getPropertiesByType($propertyType);
        foreach ($props as $property) {
            if ($property->getRelatedCreature() === $creature) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param int $propertyType
     * @return Property
     */
    public function addProperty($propertyType)
    {
        $property = new Property($this, $propertyType);
        $this->properties[$property->getId()] = $property;
        return $property;
    }

    /**
     * @param string $foodType
     * @param int $eatCount
     * @param bool $useFat
     * @param bool $useProperties
     * @return array|null
     */
    public function eat($foodType, $eatCount = 1, $useFat = true, $useProperties = true)
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
        if ($this->currentFood == 0) {
            $this->currentFood = 1;
            $eaten = true;
        } else {
            foreach ($this->properties as $property) {
                if ($property->getEatenFood() < $property->getNeedFood()) {
                    $property->eat();
                    $propertyId = $property->getId();
                    $eaten = true;
                    break;
                }
            }
            if (!$eaten && $useFat) {
                foreach ($this->properties as $property) {
                    if ($property->is(PropertyBank::FAT) && !$property->hasFat()) {
                        $property->eat();
                        $propertyId = $property->getId();
                        $workFoodType = Game::FOOD_TYPE_FAT;
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
    public function loseFood()
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
            $this->currentFood--;
            $result = 0;
        } else {
            $prevProp->loseFood();
            $result = $prevProp->getId();
        }

        return $result;
    }

    /**
     * @return bool
     */
    public function isUnderfed()
    {
        return ($this->getNeedFood() > 0);
    }

    /**
     * @return int
     */
    public function getNeedFood() {
        return $this->getTotalNeedFood() - $this->getEatenFood();
    }

    /**
     * @return int
     */
    public function getTotalNeedFood()
    {
        $result = self::NEED_FOOD;
        foreach ($this->properties as $property) {
            $result += $property->getNeedFood();
        }

        return $result;
    }

    /**
     * @return int
     */
    public function getEatenFood()
    {
        $result = $this->currentFood;
        foreach ($this->properties as $property) {
            $result += $property->getEatenFood();
        }

        return $result;
    }

    /**
     * @return bool
     */
    public function isHungry()
    {
        if ($this->isUnderfed()) {
            return true;
        }

        return ($this->getCurrentFat() < $this->getTotalFat());
    }

    /**
     * @return int
     */
    public function getCurrentFat()
    {
        $result = 0;
        foreach ($this->properties as $property) {
            if ($property->is(PropertyBank::FAT) && $property->hasFat()) {
                $result++;
            }
        }

        return $result;
    }

    /**
     * @return int
     */
    public function getTotalFat()
    {
        $result = 0;
        foreach ($this->properties as $property) {
            if ($property->is(PropertyBank::FAT)) {
                $result++;
            }
        }

        return $result;
    }

    /**
     * @return bool
     */
    public function hasActivities()
    {
        foreach ($this->properties as $property) {
            if ($property->hasActivity()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivities()
    {
        foreach ($this->properties as $property) {
            if ($property->hasPotentialActivity()) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return void
     */
    public function trySurvive()
    {
        //TODO
        /*
            - если существо сытое, ничего делать не надо
            - если голодное
                - если есть жир, и его достаточно, чтобы прокормиться, применяется жир. Выход
                - если есть спячка, активируется. Выход
        */
    }

    /**
     * @return array
     */
    public function dropRelPropertiesOnDie()
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

    /**
     * @param Property $property
     * @return array
     */
    public function dropProperty($property)
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

    /**
     * @param Property $property
     * @return bool
     */
    public function removeProperty($property)
    {
        if (!array_key_exists($property->getId(), $this->properties)) {
            return false;
        }

        unset($this->properties[$property->getId()]);
        return true;
    }

    /**
     * @return void
     */
    public function prepareToFeedTurn()
    {
        foreach ($this->properties as $property) {
            $property->prepareToFeedTurn();
        }
    }

    /**
     * @return array
     */
    public function onFeedPhaseFinished()
    {
        $this->currentFood = 0;

        $result = [];
        foreach ($this->properties as $property) {
            $report = $property->onFeedPhaseFinished();
            if (!empty($report)) {
                $result[$property->getId()] =  $report;
            }
        }
        return $result;
    }

    /**
     * @return int
     */
    public function calcScore()
    {
        $result = 2;
        foreach ($this->properties as $property) {
            $result += $property->calcScore();
        }
        return $result;
    }

    /**
     * @return void
     */
    public function poison()
    {
        $this->isPoisoned = true;
    }

    /**
     * @return bool
     */
    public function isBig()
    {
        return $this->hasProperty(PropertyBank::BIG);
    }

    /**
     * @return bool
     */
    public function isSwimming()
    {
        return $this->hasProperty(PropertyBank::SWIM);
    }

    /**
     * @return bool
     */
    public function isHidden()
    {
        return $this->hasProperty(PropertyBank::HIDE);
    }

    /**
     * @return bool
     */
    public function isAcute()
    {
        return $this->hasProperty(PropertyBank::ACUTE);
    }

    /**
     * @return bool
     */
    public function isHole()
    {
        return $this->hasProperty(PropertyBank::HOLE);
    }

    /**
     * @return bool
     */
    public function isSymbiont()
    {
        foreach ($this->properties as $property) {
            if ($property->is(PropertyBank::SYMBIOSIS) && ($property->getAsymm() == 0)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param int $type
     * @return bool
     */
    public function hasProperty($type)
    {
        foreach ($this->properties as $property) {
            if ($property->is($type)) {
                return true;
            }
        }

        return false;
    }
}
