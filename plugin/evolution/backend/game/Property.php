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

    public function __construct($creature, $type)
    {
        $this->id = ++self::$idCounter;
        $this->creature = $creature;
        $this->type = $type;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }
}
