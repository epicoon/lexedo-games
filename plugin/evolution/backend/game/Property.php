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

    /** @var int */
    private $asymm;

    /** @var bool */
    private $isAvatar;

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
        $this->asymm = 0;
        $this->isAvatar = false;
    }

    /**
     * @param Property $property1
     * @param Property $property2
     * @return array|null
     */
    public static function bindPareProperties($property1, $property2)
    {
        if ($property1->getType() != $property2->getType()) {
            return false;
        }

        $property1->setRelation($property2);
        $property2->setRelation($property1);
        $property2->setAvatar();
        
        if (PropertyBank::isSymmetric($property1->getType())) {
            return null;
        }

        $property1->setAsymm(0);
        $property2->setAsymm(1);
        return [0, 1];
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
     * @return string
     */
    public function getName()
    {
        return PropertyBank::getName($this->type);
    }

    /**
     * @return bool
     */
    public function isAvailable()
    {
        return !$this->isPaused && ($this->isStopped == 0);
    }

    public function setAvatar()
    {
        $this->isAvatar = true;
    }

    /**
     * @param int $asymm
     */
    public function setAsymm($asymm)
    {
        $this->asymm = $asymm;
    }

    /**
     * @return int
     */
    public function getAsymm()
    {
        return $this->asymm;
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
     * @return PropertyBehavior
     */
    public function getBehavior()
    {
        return $this->behavior;
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
        if ($this->is(PropertyBank::FAT)) {
            return 0;
        }

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
     * @return bool
     */
    public function loseFood()
    {
        if ($this->currentFood < 1) {
            return false;
        }

        $this->currentFood--;
        return true;
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
    public function prepareToFeedTurn()
    {
        $this->isPaused = false;
    }

    /**
     * @return array
     */
    public function onFeedPhaseFinished()
    {
        if ($this->is(PropertyBank::FAT)) {
            return [];
        }

        $this->currentFood = 0;

        $this->isPaused = false;
        $map = [];
        if ($this->isStopped > 0) {
            $this->isStopped--;
            $map[] = 'isStopped';
        }
        
        return $this->behavior->getStateReport($map);
    }

    /**
     * @param string $foodType
     * @return array|null
     */
    public function onFeed($foodType)
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
                    'name' => $this->getGamer()->getUser()->name,
                    'property' => $this->getName(),
                ]);
            }
        }

        return $result;
    }

    /**
     * @return integer
     */
    public function calcScore()
    {
        if ($this->isAvatar) {
            return 0;
        }

        return $this->getNeedFood() + 1;
    }
}
