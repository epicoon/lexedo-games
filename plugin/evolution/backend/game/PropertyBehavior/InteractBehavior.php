<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Game;

/**
 * Class InteractBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class InteractBehavior extends PropertyBehavior
{
    /**
     * @param string $foodType
     * @return array|null
     */
    public function onFeed($foodType)
    {
        if ($foodType != Game::FOOD_TYPE_RED) {
            return null;
        }

        if ($this->getGame()->getFoodCount() == 0) {
            return null;
        }

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
        $feedReport = $relCreature->eat(Game::FOOD_TYPE_RED);
        if (!$feedReport) {
            return null;
        }
        
        $this->getGame()->log('logMsg.propOnFeed', [
            'property' => $this->property->getName(),
        ]);

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
