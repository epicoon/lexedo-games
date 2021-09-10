<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Creature;

/**
 * Class DropTailBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class DropTailBehavior extends PropertyBehavior
{
    /**
     * @return array|false
     * @param array $data
     */
    public function run($data = [])
    {
        if (!$this->getGame()->getAttakCore()->isOnHold()) {
            return false;
        }

        $targetCreature = $this->getCreature();
        $targetProperty = $targetCreature->getPropertyById($data['targetProperty']);
        if (!$targetProperty) {
            return false;
        }

        $carnival = $this->getGame()->getAttakCore()->getCarnival();
        return $this->getGame()->getAttakCore()->runAttakTail($carnival, $targetProperty);
    }
}
