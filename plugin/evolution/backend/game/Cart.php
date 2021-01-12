<?php

namespace lexedo\games\evolution\backend\game;

/**
 * Class Cart
 * @package lexedo\games\evolution\backend\game
 */
class Cart
{
    private static $idCounter = 0;

    /** @var int */
    private $id;

    /** @var array */
    private $properties = [];

    public function __construct($prop1, $prop2 = null)
    {
        $this->id = ++self::$idCounter;

        $this->properties[] = $prop1;
        if ($prop2) {
            $this->properties[] = $prop2;
        }
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $type
     * @return bool
     */
    public function hasProperty($type)
    {
        return in_array($type, $this->properties);
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return array_merge([$this->id], $this->properties);
    }
}
