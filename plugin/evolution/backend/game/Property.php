<?php

namespace lexedo\games\evolution\backend\game;

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

    public function __construct($creature, $type)
    {
        $this->id = ++self::$idCounter;
        $this->creature = $creature;
        $this->type = $type;

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
     * @return int
     */
    public function getType()
    {
        return $this->type;
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
     * //TODO!!!!!!!!!!!!!!!! полиморфизм?
     * @return bool
     */
    public function hasFat()
    {
        return $this->currentFood > 0;
    }

    /**
     * @return void
     */
    public function eat()
    {
        $this->currentFood++;
    }

    /**
     * @return void
     */
    public function reset()
    {
        $this->currentFood = 0;


        //TODO паузы стопы
    }
}
