<?php

namespace lexedo\games\evolution\backend\game;

/**
 * Class Creature
 * @package lexedo\games\evolution\backend\game
 */
class Creature
{
    private static $idCounter = 0;

    /** @var integer */
    private $id;

    /** @var Gamer */
    private $gamer;

    /** @var Property[] */
    private $properties;

    /**
     * Creature constructor.
     * @param Gamer $gamer
     */
    public function __construct($gamer)
    {
        $this->id = ++self::$idCounter;
        $this->gamer = $gamer;
        $this->properties = [];
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
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
}
