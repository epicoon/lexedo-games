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

    /** @var integer */
    private $id;

    /** @var Gamer */
    private $gamer;

    /** @var Property[] */
    private $properties;

    /** @var integer */
    private $currentFood;

    /** @var bool */
    private $isDead;

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
        $this->isDead = false;
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
    public function isDead()
    {
        return $this->isDead;
    }

    /**
     * @return bool
     */
    public function mustDieOut()
    {
        if ($this->isDead()) {
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
     * @param integer $type
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
     * @param integer $id
     * @return Property|null
     */
    public function getPropertyById($id)
    {
        return $this->properties[$id] ?? null;
    }

    /**
     * @param integer $type
     * @return bool
     */
    public function canAttachProperty($type)
    {
        if (PropertyBank::isSingle($type)) {
            return empty($this->getPropertiesByType($type));
        }

        return true;
    }

    /**
     * @param Creature $creature
     * @param integer $propertyType
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
     * @param integer $propertyType
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
     * @return array|null
     */
    public function eat($foodType, $useProperties = true)
    {
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
            if (!$eaten) {
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
            [
                'creatureId' => $this->getId(),
                'propertyId' => $propertyId,
                'foodType' => $workFoodType,
            ]
        ];

        if ($useProperties) {
            //TODO учет свойств
        }

        return $feedReport;
    }

    /**
     * @return bool
     */
    public function isUnderfed()
    {
        return ($this->getNeedFood() > 0);
    }

    /**
     * @return integer
     */
    public function getNeedFood() {
        return $this->getTotalNeedFood() - $this->getEatenFood();
    }

    /**
     * @return integer
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
     * @return integer
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
     * @return integer
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
     * @return integer
     */
    public function getTotalFat()
    {
        $result = 0;
        foreach ($this->properties as $property) {
            if ($property->getType() == PropertyBank::FAT) {
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
    public function dropProperties()
    {
        $result = [];

        foreach ($this->properties as $property) {
            $relProp = $property->getRelatedProperty();
            if ($relProp) {
                $result[] = [
                    $relProp->getCreature()->getId(),
                    $relProp->getId(),
                ];
                $relProp->drop();
            }

            $this->getGamer()->incDroppingCounter();
        }
        $this->properties = [];

        return $result;
    }

    /**
     * @param Property $property
     */
    public function dropProperty($property)
    {
        if (!array_key_exists($property->getId(), $this->properties)) {
            return;
        }

        unset($this->properties[$property->getId()]);
        $this->getGamer()->incDroppingCounter();
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
            if ($report) {
                $result[$property->getId()] =  $report;
            }
        }
        return $result;
    }

    /**
     * @return integer
     */
    public function calcScore()
    {
        $result = 2;
        foreach ($this->properties as $property) {
            $result += ($property->getNeedFood() + 1);
        }
        return $result;
    }
}
