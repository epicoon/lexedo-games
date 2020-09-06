<?php

namespace lexedo\games\evolution\backend\game;

/**
 * Class AttakCore
 * @package lexedo\games\evolution\backend\game
 */
class AttakCore
{
    /**
     * @param Creature $carnival
     * @param Creature $prey
     * @return bool
     */
    public function checkAttakAvailability($carnival, $prey)
    {
        if ($carnival === $prey) {
            return false;
        }

        if ($prey->isBig() && !$carnival->isBig()) {
            return false;
        }

        if ($prey->isSwimming() !== $carnival->isSwimming()) {
            return false;
        }

        if ($prey->isHidden() && !$carnival->isAcute()) {
            return false;
        }

        if ($prey->isHole() && !$prey->isUnderfed()) {
            return false;
        }

        if ($prey->isSymbiont()) {
            return false;
        }

        return true;
    }

    /**
     * @param Creature $carnival
     * @param Creature $prey
     * @return array
     */
    public function runAttak($carnival, $prey)
    {
        //TODO

        // resultType:
        // - success
        // - successWithPoison
        // - pending
        //      - есть мимикрия (на 2 и более существ)
        //      - отбрасывание хвоста (с 2 и более свойствами)
        //      - есть одновременно мимикрия (на 1 и более существ) и отбрасывание хвоста
        // - fail - на быстрое, если убежало

        // {result, poisoned, feedReport}


        $preyGamer = $prey->getGamer();
        $creatureDropReport = $preyGamer->dropCreature($prey);

        $feedReport = $carnival->eat(Game::FOOD_TYPE_BLUE, 2);
        $result = $carnival->getGamer()->onCreatureUsedAttak($carnival);

        $addFeedReport = $result['feedReport'] ?? null;
        if ($addFeedReport) {
            $feedReport = array_merge($feedReport, $addFeedReport);
        }

        return [
            'result' => Constants::ATTAK_RESULT_SUCCESS,

            'preyGamer' => $preyGamer->getId(),
            'preyReport' => $creatureDropReport,
            'feedReport' => $feedReport,
        ];
    }
}
