<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\evolution\backend\game\PropertyBehavior\PropertyBehavior;

/**
 * Class Property
 * @package lexedo\games\evolution\backend\game
 */
class Property
{
    private static $idCounter = 0;

    /** @var integer */
    private $id;

    /** @var Creature */
    private $creature;

    /** @var integer */
    private $type;

    /** @var integer */
    private $currentFood;

    /** @var bool */
    private $isPaused;

    /** @var integer */
    private $isStopped;

    /** @var PropertyBehavior */
    private $behavior;

    /** @var Property|null */
    private $relProperty;

    public function __construct($creature, $type)
    {
        $this->id = ++self::$idCounter;
        $this->creature = $creature;
        $this->type = $type;

        $this->currentFood = 0;
        $this->isPaused = false;
        $this->isStopped = 0;

        $this->behavior = PropertyBehavior::create($this);
        $this->relProperty = null;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return bool
     */
    public function isAvailable()
    {
        return !$this->isPaused && ($this->isStopped == 0);
    }

    /**
     * @return Game
     */
    public function getGame()
    {
        return $this->getGamer()->getGame();
    }

    /**
     * @return Gamer
     */
    public function getGamer()
    {
        return $this->creature->getGamer();
    }

    /**
     * @return Creature
     */
    public function getCreature()
    {
        return $this->creature;
    }

    /**
     * @param integer $type
     * @return bool
     */
    public function is($type)
    {
        return $this->type == $type;
    }

    /**
     * @param bool $value
     */
    public function setPaused($value = true)
    {
        $this->isPaused = $value;
    }

    /**
     * @return bool
     */
    public function isPaused()
    {
        return $this->isPaused;
    }

    /**
     * @param int $turns
     */
    public function setStopped($turns = 1)
    {
        $this->isStopped = $turns;
    }

    /**
     * @return int
     */
    public function getStopped()
    {
        return $this->isStopped;
    }

    /**
     * @return bool
     */
    public function hasActivity()
    {
        return $this->behavior->hasActivity();
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return $this->behavior->hasPotentialActivity();
    }

    /**
     * @return int
     */
    public function getNeedFood()
    {
        return PropertyBank::getNeedFood($this->type);
    }

    /**
     * @return integer
     */
    public function getEatenFood()
    {
        return $this->currentFood;
    }

    /**
     * @return bool
     */
    public function hasFat()
    {
        if ($this->is(PropertyBank::FAT)) {
            return $this->currentFood > 0;
        }

        return false;
    }

    /**
     * @return void
     */
    public function eat()
    {
        $this->currentFood++;
    }

    /**
     * @param Property $relProperty
     */
    public function setRelation($relProperty)
    {
        $this->relProperty = $relProperty;
    }

    /**
     * @return Property|null
     */
    public function getRelatedProperty()
    {
        return $this->relProperty;
    }

    /**
     * @return Creature|null
     */
    public function getRelatedCreature()
    {
        if (!$this->relProperty) {
            return null;
        }

        return $this->relProperty->getCreature();
    }

    /**
     * @return void
     */
    public function drop()
    {
        $this->getCreature()->dropProperty($this);
    }

    /**
     * @return void
     */
    public function prepareToFeedTurn()
    {
        $this->isPaused = false;
    }

    /**
     * @return array
     */
    public function onFeedPhaseFinished()
    {
        $this->currentFood = 0;

        $this->isPaused = false;
        if ($this->isStopped > 0) {
            $this->isStopped--;
        }
        
        return $this->behavior->getStateReport();

        //TODO - to behavior
//        return [
//            'isStopped' => $this->isStopped,
//        ];
    }

    /**
     * @param array $data
     * @return array
     */
    public function runAction($data = [])
    {
        return $this->behavior->run();
    }
}
