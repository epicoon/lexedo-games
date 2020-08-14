<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\Gamer;
use lexedo\games\evolution\backend\game\Creature;
use lexedo\games\evolution\backend\game\Property;
use lexedo\games\evolution\backend\game\PropertyBank;

/**
 * Class PropertyBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class PropertyBehavior
{
    /** @var Property */
    protected $property;

    /**
     * @param Property $property
     * @return PropertyBehavior
     */
    public static function create($property)
    {
        switch ($property->getType()) {
            case PropertyBank::TRAMP: return new TrampBehavior($property);
            case PropertyBank::HIBERNATE: return new HibernateBehavior($property);

            default: return new self($property);
        }
    }

    /**
     * PropertyBehavior constructor.
     * @param Property $property
     */
    protected function __construct($property)
    {
        $this->property = $property;
    }

    /**
     * @return int
     */
    public function getType()
    {
        return $this->property->getType();
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
        return $this->getCreature()->getGamer();
    }

    /**
     * @return Creature
     */
    public function getCreature()
    {
        return $this->property->getCreature();
    }

    /**
     * @return Property
     */
    public function getProperty()
    {
        return $this->property;
    }

    /**
     * @return array|null
     */
    public function getStateReport()
    {
        return null;
    }

    /**
     * @return bool
     */
    public function hasActivity()
    {
        return false;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return false;
    }

    /**
     * @return array
     */
    public function run()
    {
        return [];
    }
}
