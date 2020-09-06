<?php

namespace lexedo\games\evolution\backend\game;

/**
 * Class CarnivalCore
 * @package lexedo\games\evolution\backend\game
 */
class CarnivalCore
{
    private $game;

    /**
     * CarnivalCore constructor.
     * @param Game $game
     */
    public function __construct($game)
    {
        $this->game = $game;
    }

    /**
     * @param Creature $carnival
     * @return array|null
     */
    public function onAttak($carnival)
    {
        $scavenger = $this->findScavenger($carnival);
        if ($scavenger) {
            $foodReport = $scavenger->eat(Game::FOOD_TYPE_BLUE);
            return [
                'feedReport' => $foodReport,
            ];
        }

        return null;
    }

    /**
     * @param Creature $carnival
     * @return Creature|null
     */
    private function findScavenger($carnival)
    {
        $carnivalGamer = $carnival->getGamer();
        $scavenger = $this->getScavengerForGamer($carnivalGamer);
        if ($scavenger) {
            return $scavenger;
        }

        $carnivalGamerIndex = $this->game->getGamerIndex($carnivalGamer);
        $gamerIndex = $carnivalGamerIndex + 1;
        while ($gamerIndex != $carnivalGamerIndex) {
            if ($gamerIndex == $this->game->getGamersCount()) {
                $gamerIndex = 0;
            }

            $gamer = $this->game->getGamerByIndex($gamerIndex);
            $scavenger = $this->getScavengerForGamer($gamer);
            if ($scavenger) {
                return $scavenger;
            }

            $gamerIndex++;
        }

        return null;
    }

    /**
     * @param Gamer $gamer
     * @return Creature|null
     */
    private function getScavengerForGamer($gamer)
    {
        $creatures = $gamer->getCreatures();
        foreach ($creatures as $creature) {
            if ($creature->hasProperty(PropertyBank::SCAVENGER)) {
                return $creature;
            }
        }

        return null;
    }
}
