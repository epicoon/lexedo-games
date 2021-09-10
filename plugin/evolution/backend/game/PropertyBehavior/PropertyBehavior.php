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
            case PropertyBank::PIRACY: return new PiracyBehavior($property);
            case PropertyBank::FAT: return new FatBehavior($property);
            case PropertyBank::INTERACT: return new InteractBehavior($property);
            case PropertyBank::COOP: return new CoopBehavior($property);
            case PropertyBank::CARNIVAL: return new CarnivalBehavior($property);
            case PropertyBank::MIMICRY: return new MimicryBehavior($property);
            case PropertyBank::DROP_TAIL: return new DropTailBehavior($property);

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
     * @return bool
     */
    public function hasActivity()
    {
        return $this->getProperty()->isAvailable() && $this->hasPotentialActivity();
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return false;
    }

    /**
     * @param array $map
     * @return array
     */
    public function getStateReport($map = [])
    {
        $result = [];

        if (in_array('isPaused', $map) || $this->property->isPaused()) {
            $result['isPaused'] = $this->property->isPaused();
        }

        if (in_array('isStopped', $map) || $this->property->getStopped()) {
            $result['isStopped'] = $this->property->getStopped();
        }

        return $result;
    }

    /**
     * @param string $foodType
     * @return array|null
     */
    public function onFeed($foodType)
    {
        return null;
    }

    /**
     * @return string
     */
    public function getLogKey()
    {
        return 'logMsg.useProp';
    }

    /**
     * @return array|false
     * @param array $data
     */
    public function run($data = [])
    {
        return false;
    }
}
