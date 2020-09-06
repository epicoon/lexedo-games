<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Game;

/**
 * Class CoopBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class CoopBehavior extends PropertyBehavior
{
    /**
     * @param string $foodType
     * @return array|null
     */
    public function onFeed($foodType)
    {
        $relProperty = $this->getProperty()->getRelatedProperty();
        if (!$relProperty->isAvailable()) {
            return null;
        }

        $relCreature = $relProperty->getCreature();
        if (!$relCreature->isHungry()) {
            return null;
        }

        $this->getProperty()->setPaused();
        $relProperty->setPaused();
        $feedReport = $relCreature->eat(Game::FOOD_TYPE_BLUE);
        if (!$feedReport) {
            return null;
        }

        return [
            'feedReport' => $feedReport,
            'pareState' => [
                'propertyId' => $this->getProperty()->getId(),
                'state' => $this->getStateReport(),
                'relCreatureId' => $relCreature->getId(),
                'relPropertyId' => $relProperty->getId(),
                'relState' => $relProperty->getBehavior()->getStateReport(),
            ]
        ];
    }
}
