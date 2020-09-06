<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Game;

/**
 * Class FatBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class FatBehavior extends PropertyBehavior
{
    /**
     * @return bool
     */
    public function hasActivity()
    {
        return $this->getProperty()->isAvailable()
            && $this->getGamer()->isAvailableToUseFat($this->getCreature())
            && $this->getProperty()->hasFat()
            && $this->getCreature()->isUnderfed()
        ;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return $this->getProperty()->hasFat()
            && $this->getCreature()->isUnderfed()
        ;
    }

    /**
     * @return array|false
     * @param array $data
     */
    public function run($data = [])
    {
        $this->getProperty()->loseFood();
        $feedReport = $this->property->getCreature()->eat(
            Game::FOOD_TYPE_BLUE,
            1,
            false,
            false
        );

        $this->getGamer()->onCreatureUseFat($this->getCreature());

        return [
            'feedReport' => $feedReport,
        ];
    }
}
