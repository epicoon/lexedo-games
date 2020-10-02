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
    public function hasPotentialActivity()
    {
        return $this->getGame()->getFoodCount()
            && $this->getGame()->hasHungryCreature()
        ;
    }

    /**
     * @return string
     */
    public function getLogKey()
    {
        return 'logMsg.useTramp';
    }

    /**
     * @return array|false
     * @param array $data
     */
    public function run($data = [])
    {
        $this->getGame()->wasteFood();
        $this->property->setPaused();
        return [
            'foodCount' => $this->getGame()->getFoodCount(),
            'state' => $this->getStateReport(),
        ];
    }
}
