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
     * @param int $type
     * @return bool
     */
    public function canAttachProperty($type)
    {
        $isSingle = PropertyBank::isSingle($type);
        if (!$isSingle) {
            return true;
        }

        foreach ($this->properties as $property) {
            if ($property->getType() == $type) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param Property $propertyType
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
    public function eat($foodType)
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

        //TODO учет свойств

        return $feedReport;
    }

    /**
     * @return bool
     */
    public function isHungry()
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
    public function canEat()
    {
        if ($this->isHungry()) {
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
        // TODO

        return false;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivities()
    {
        // TODO

        return false;
    }
}
