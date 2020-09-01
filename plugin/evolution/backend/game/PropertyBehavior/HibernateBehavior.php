<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Game;

/**
 * Class HibernateBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class HibernateBehavior extends PropertyBehavior
{
    /**
     * @return bool
     */
    public function hasActivity()
    {
        return $this->getProperty()->isAvailable()
            && $this->getCreature()->isUnderfed()
        ;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return $this->getProperty()->isAvailable()
            && $this->getCreature()->isUnderfed()
        ;
    }

    /**
     * @return array
     */
    public function getStateReport()
    {
        $result = parent::getStateReport();
        $result['isStopped'] = $this->property->getStopped();
        return $result;
    }

    /**
     * @return array
     */
    public function run()
    {
        if (!$this->getCreature()->isUnderfed()) {
            return [];
        }

        $feedReport = [];
        $currentFeedReport = $this->property->getCreature()->eat(
            Game::FOOD_TYPE_BLUE,
            false,
            false
        );
        while ($currentFeedReport) {
            $feedReport = array_merge($feedReport, $currentFeedReport);
            $currentFeedReport = $this->property->getCreature()->eat(
                Game::FOOD_TYPE_BLUE,
                false,
                false
            );
        }

        $this->property->setStopped(2);

        return [
            'feedReport' => $feedReport,
            'state' => $this->getStateReport(),
        ];
    }
}
