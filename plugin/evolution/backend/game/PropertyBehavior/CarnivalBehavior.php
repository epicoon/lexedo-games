<?php

namespace lexedo\games\evolution\backend\game\PropertyBehavior;

/**
 * Class CarnivalBehavior
 * @package lexedo\games\evolution\backend\game\PropertyBehavior
 */
class CarnivalBehavior extends PropertyBehavior
{
    /**
     * @return bool
     */
    public function hasActivity()
    {
        return $this->getGamer()->isAvailableToFeedCreature()
            && $this->hasPotentialActivity()
        ;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivity()
    {
        return $this->getProperty()->isAvailable()
            && $this->getCreature()->isHungry()
            && !empty($this->getTargets())
        ;
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

        $attakResult = $this->getGame()->getAttakCore()->runAttak(
            $this->getCreature(),
            $targetCreature
        );

        $this->property->setStopped(1);
        $attakResult['state'] = $this->getStateReport();

        return $attakResult;
    }

    /**
     * @return array
     */
    private function getTargets()
    {
        $carnival = $this->getCreature();
        $game = $this->getGame();
        $attakCore = $game->getAttakCore();

        $result = [];
        foreach ($game->getGamers() as $gamer) {
            foreach ($gamer->getCreatures() as $creature) {
                if ($attakCore->checkAttakAvailability($carnival, $creature)) {
                    $result[] = $creature;
                }
            }
        }
        return $result;
    }
}
