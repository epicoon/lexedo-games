<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

/**
 * Class TrampBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class TrampBehavior extends PropertyBehavior
{
    /**
     * @return bool
     */
    public function hasActivity()
    {
        return $this->getProperty()->isAvailable()
            && $this->getGame()->getFoodCount()
            && $this->getGame()->hasHungryCreature()
        ;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return $this->getGame()->getFoodCount()
            && $this->getGame()->hasHungryCreature()
        ;
    }

    /**
     * @return array
     */
    public function run()
    {
        $this->getGame()->wasteFood();
        $this->property->setPaused();
        return [
            'foodCount' => $this->getGame()->getFoodCount(),
            'state' => $this->getStateReport(),
        ];
    }
}
