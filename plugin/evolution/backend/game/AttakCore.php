<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\evolution\backend\game\PropertyBehavior\MimicryBehavior;
use lx\Math;

class AttakCore
{
    private Game $game;
    private ?array $hold;

    public function __construct(Game $game)
    {
        $this->game = $game;
        $this->hold = null;
    }
    
    public function hold(Creature $carnival, Creature $prey): void
    {
        $this->hold = [
            'carnival' => $carnival,
            'prey' => $prey,
        ];
    }

    public function getPendingGamer(): ?Gamer
    {
        if ($this->hold === null) {
            return null;
        }

        return $this->hold['prey']->getGamer();
    }

    public function isOnHold(): bool
    {
        return $this->hold !== null;
    }

    public function getCarnival(): ?Creature
    {
        if ($this->hold === null) {
            return null;
        }

        return $this->hold['carnival'];
    }

    public function getPrey(): ?Creature
    {
        if ($this->hold === null) {
            return null;
        }

        return $this->hold['prey'];
    }

    public function checkAttakAvailability(Creature $carnival, Creature $prey): bool
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

    public function runAttak(Creature $carnival, Creature $prey): array
    {
        $this->hold = null;
        
        $this->game->log('logMsg.attak', [
            'carnivalGamerName' => $carnival->getGamer()->getAuthField(),
            'preyGamerName' => $prey->getGamer()->getAuthField(),
        ]);

        $carnival->getGamer()->onCreatureAttak($carnival);

        $preyGamer = $prey->getGamer();
        $result = [
            'preyGamer' => $preyGamer->getId(),
        ];

        if ($prey->hasProperty(PropertyBank::FAST)) {
            $success = Math::gamble(0.5);
            if ($success) {
                $this->game->log('logMsg.creatureRanAway');
                $result['result'] = Constants::ATTAK_RESULT_FAIL;
                return $result;
            } else {
                $this->game->log('logMsg.creatureRanAwayFail');
            }
        }
        
        $needPending = $this->checkNeedPending($carnival, $prey);
        if ($needPending) {
            $this->hold($carnival, $prey);
            $result = array_merge($result, [
                'result' => Constants::ATTAK_RESULT_PENDING,
                'carnivalGamer' => $carnival->getGamer()->getId(),
                'carnival' => $carnival->getId(),
                'prey' => $prey->getId(),
            ]);

            $this->game->log('logMsg.waitingForDefens', [
                'name' => $prey->getGamer()->getAuthField()
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
            $this->game->log('logMsg.poisoned', [
                'name' => $carnival->getGamer()->getAuthField(),
            ]);
            
            $carnival->poison();
            $result['poisoned'] = true;
        }

        return $result;
    }

    public function runAttakTail(Creature $carnival, Property $tail): array
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

    private function checkNeedPending(Creature $carnival, Creature $prey): bool
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
