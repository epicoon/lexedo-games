<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\evolution\backend\game\PropertyBehavior\MimicryBehavior;
use lx\Math;

/**
 * Class AttakCore
 * @package lexedo\games\evolution\backend\game
 */
class AttakCore
{
    /** @var Game */
    private $game;

    /** @var array|null */
    private $hold;

    /**
     * AttakCore constructor.
     * @param Game $game
     */
    public function __construct($game)
    {
        $this->game = $game;
        $this->hold = null;
    }

    /**
     * @return Gamer
     */
    public function getPendingGamer()
    {
        if ($this->hold === null) {
            return null;
        }

        return $this->hold['prey']->getGamer();
    }

    /**
     * @return bool
     */
    public function isOnHold()
    {
        return $this->hold !== null;
    }

    /**
     * @return Gamer|null
     */
    public function getCarnival()
    {
        if ($this->hold === null) {
            return null;
        }

        return $this->hold['carnival'];
    }

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
        $this->hold = null;

        $carnival->getGamer()->onCreatureAttak($carnival);

        $preyGamer = $prey->getGamer();
        $result = [
            'log' => [],
            'preyGamer' => $preyGamer->getId(),
        ];

        if ($prey->hasProperty(PropertyBank::FAST)) {
            $success = Math::gamble(0.5);
            if ($success) {
                $result['log'][] = 'Существо убежало, атака хищника не удалась';
                $result['result'] = Constants::ATTAK_RESULT_FAIL;
                return $result;
            } else {
                $result['log'][] = 'Существо пыталось убежать, но не смогло';
            }
        }
        
        $needPending = $this->checkNeedPending($carnival, $prey);
        if ($needPending) {
            $this->hold = [
                'carnival' => $carnival,
                'prey' => $prey,
            ];
            $result = array_merge($result, [
                'result' => Constants::ATTAK_RESULT_PENDING,
                'carnivalGamer' => $carnival->getGamer()->getId(),
                'carnival' => $carnival->getId(),
                'prey' => $prey->getId(),
            ]);
            return $result;
        }

        $poisoned = $prey->hasProperty(PropertyBank::VENOM);
        $creatureDropReport = $preyGamer->dropCreature($prey);

        $feedReport = $carnival->eat(Game::FOOD_TYPE_BLUE, 2);
        $addFeedReport = $carnival->getGamer()->onCreatureSuccessfullAttak($carnival);
        $addFeedReport = $addFeedReport['feedReport'] ?? null;
        if ($addFeedReport) {
            $feedReport = array_merge($feedReport, $addFeedReport);
        }

        $result = array_merge($result, [
            'result' => Constants::ATTAK_RESULT_SUCCESS,
            'preyReport' => $creatureDropReport,
            'feedReport' => $feedReport,
        ]);

        if ($poisoned) {
            $carnival->poison();
            $result['poisoned'] = true;
        }

        return $result;
    }

    /**
     * @param Creature $carnival
     * @param Property $tail
     * @return array
     */
    public function runAttakTail($carnival, $tail)
    {
        $this->hold = null;

        $tailDropReport = $tail->getCreature()->dropProperty($tail);
        $feedReport = $carnival->eat(Game::FOOD_TYPE_BLUE);
        return [
            'result' => Constants::ATTAK_RESULT_TAIL,
            'feedReport' => $feedReport,
            'tailReport' => $tailDropReport,
        ];
    }

    /**
     * @param Creature $carnival
     * @param Creature $prey
     * @return bool
     */
    private function checkNeedPending($carnival, $prey)
    {
        if ($prey->hasProperty(PropertyBank::DROP_TAIL)) {
            return true;
        }

        if ($prey->hasProperty(PropertyBank::MIMICRY)) {
            $mimicry = $prey->getPropertiesByType(PropertyBank::MIMICRY)[0];

            /** @var MimicryBehavior $behavior */
            $behavior = $mimicry->getBehavior();
            $goals = $behavior->getTargets($carnival);
            if (!empty($goals)) {
                return true;
            }
        }

        return false;
    }
}
