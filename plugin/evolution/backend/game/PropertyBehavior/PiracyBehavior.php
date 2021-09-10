<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

use lexedo\games\evolution\backend\game\Game;

/**
 * Class PiracyBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class PiracyBehavior extends PropertyBehavior
{
    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return !empty($this->getTargets());
    }

    /**
     * @return array|false
     * @param array $data
     */
    public function run($data = [])
    {
        $targetGamer = $this->getGame()->getGamerById($data['targetGamer']);
        if (!$targetGamer) {
            return false;
        }

        $targetCreature = $targetGamer->getCreatureById($data['targetCreature']);
        if (!$targetCreature) {
            return false;
        }

        $targets = $this->getTargets();
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

        $propId = $targetCreature->loseFood();
        $feedReport = $this->property->getCreature()->eat(Game::FOOD_TYPE_BLUE);
        $this->property->setStopped(1);

        return [
            'targetGamer' => $targetGamer->getId(),
            'targetCreature' => $targetCreature->getId(),
            'targetProperty' => $propId,
            'feedReport' => $feedReport,
            'state' => $this->getStateReport(),
        ];
    }

    /**
     * @return array
     */
    private function getTargets()
    {
        $result = [];

        $game = $this->getGame();
        foreach ($game->getGamers() as $gamer) {
            foreach ($gamer->getCreatures() as $creature) {
                if ($creature == $this->getCreature()) {
                    continue;
                }

                if ($creature->isUnderfed() && $creature->getEatenFood() > 0) {
                    $result[] = $creature;
                }
            }
        }

        return $result;
    }
}
