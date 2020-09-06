<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Creature;

/**
 * Class MimicryBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class MimicryBehavior extends PropertyBehavior
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

        $targetGamer = $this->getGamer();
        $targetCreature = $targetGamer->getCreatureById($data['targetCreature']);
        if (!$targetCreature) {
            return false;
        }

        $carnival = $this->getGame()->getAttakCore()->getCarnival();

        $targets = $this->getTargets($carnival);
        $match = false;
        foreach ($targets as $target) {
            if ($target == $targetCreature) {
                $match = true;
                break;
            }
        }

        if (!$match) {
            return false;
        }

        $attakResult = $this->getGame()->getAttakCore()->runAttak(
            $carnival,
            $targetCreature
        );

        $this->property->setStopped(1);
        $attakResult['state'] = $this->getStateReport();

        return $attakResult;
    }

    /**
     * @param Creature $carnival
     * @return Creature[]
     */
    public function getTargets($carnival)
    {
        $result = [];

        $gamer = $this->getGamer();
        $creatures = $gamer->getCreatures();
        foreach ($creatures as $creature) {
            if ($creature == $this->getCreature()) {
                continue;
            }

            if ($this->getGame()->getAttakCore()->checkAttakAvailability($carnival, $creature)) {
                $result[] = $creature;
            }
        }

        return $result;
    }
}
