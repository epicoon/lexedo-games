<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

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
    public function run()
    {
        if (!$this->getCreature()->isUnderfed()) {
            return [];
        }

        




//        $this->getGame()->wasteFood();
//        $this->getProperty()->setPaused();
//        return [
//            'foodCount' => $this->getGame()->getFoodCount(),
//            'state' => [
//                'isPaused' => $this->getProperty()->isPaused(),
//            ],
//        ];
    }

}
