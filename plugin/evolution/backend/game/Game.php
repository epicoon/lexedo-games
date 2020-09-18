<?php

namespace lexedo\games\evolution\backend\game;

use lx;
use lx\I18nHelper;
use lexedo\games\evolution\backend\EvolutionChannel;
use lexedo\games\evolution\Plugin;
use lx\Math;
use Exception;
use lx\socket\Channel\ChannelEvent;

/**
 * Class Game
 */
class Game
{
    const PHASE_GROW = 'grow';
    const PHASE_FEED = 'feed';

    const FOOD_TYPE_RED = 'red_food';
    const FOOD_TYPE_BLUE = 'blue_food';
    const FOOD_TYPE_FAT = 'fat_food';

    /** @var EvolutionChannel */
    private $channel;

    /** @var bool */
    private $isActive;

    /** @var CartPack */
    private $cartPack;

    /** @var Gamer[] */
    private $gamers;

    /** @var array */
    private $turnSequence;

    /** @var integer */
    private $activeGamerIndex;

    /** @var string */
    private $activePhase;

    /** @var AttakCore */
    private $attakCore;

    /** @var integer */
    private $foodCount;

    /** @var bool */
    private $isLastTurn;

    /** @var bool */
    private $isWaitingForRevenge;

    /** @var array */
    private $revengeApprovements;

    /** @var Plugin */
    private $plugin;

    /**
     * Game constructor.
     * @param EvolutionChannel $channel
     */
    public function __construct($channel)
    {
        $this->channel = $channel;
        $this->isActive = false;
        $this->gamers = [];
        $this->turnSequence = [];
        $this->attakCore = new AttakCore($this);

        $this->foodCount = 0;
        $this->isLastTurn = false;
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];

        $this->plugin = lx::$app->getPlugin('lexedo/games:evolution');
    }

    /**
     * @return EvolutionChannel
     */
    public function getChannel()
    {
        return $this->channel;
    }

    /**
     * @return Plugin
     */
    public function getPlugin()
    {
        return $this->plugin;
    }

    /**
     * @param string $key
     * @param string $lang
     * @return string
     */
    public function t($key, $lang)
    {
        return I18nHelper::translate($key, $this->getPlugin()->i18nMap, $lang);
    }

    /**
     * @return bool
     */
    public function isActive()
    {
        return $this->isActive;
    }

    /**
     * @return AttakCore
     */
    public function getAttakCore()
    {
        return $this->attakCore;
    }

    /**
     * @param Creature $carnival
     * @return array|null
     */
    public function onCreatureSuccessfullAttak($carnival)
    {
        $carnivalCore = new CarnivalCore($this);
        return $carnivalCore->onAttak($carnival);
    }

    /**
     * @param ChannelEvent $event
     */
    public function fillNewPhaseEvent($event, $phase = self::PHASE_GROW)
    {
        if ($this->isActive && $this->isLastTurn && $phase == self::PHASE_GROW) {
            $this->isActive = false;
            $this->isWaitingForRevenge = true;
            $this->revengeApprovements = [];
            return;
        }

        $this->activePhase = $phase;

        if (!$this->isActive) {
            $this->prepare();
        } else {
            $this->updateGamersSequence($this->isPhaseGrow());
            foreach ($this->gamers as $gamer) {
                $gamer->setPassed(false);
            }
        }

        $event->addData([
            'activePhase' => $this->getActivePhase(),
            'turnSequence' => $this->getTurnSequence(),
        ]);

        if ($this->isPhaseGrow()) {
            $this->foodCount = 0;
            $newCarts = $this->distributeCarts();

            $this->isLastTurn = $this->cartPack->isEmpty();
            $event->addData([
                'isLastTurn' => $this->isLastTurn,
            ]);

            foreach ($this->gamers as $id => $gamer) {
                $cartsData = [];
                /** @var Cart $cart */
                foreach ($newCarts[$id] as $cart) {
                    $cartsData[] = $cart->toArray();
                }

                $event->setDataForConnection($id, [
                    'carts' => $cartsData,
                ]);
            }
        } elseif ($this->isPhaseFeed()) {
            $this->foodCount = Math::rand(3, 8);
            $event->addData([
                'foodCount' => $this->getFoodCount(),
            ]);
        }
    }

    public function prepare()
    {
        $this->prepareCartPack();
        $this->prepareGamers();

        $this->activePhase = self::PHASE_GROW;
        $this->foodCount = 0;
        $this->isLastTurn = false;
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];
        $this->isActive = true;
    }

    /**
     * @return integer
     */
    public function getGamersCount()
    {
        return count($this->gamers);
    }

    /**
     * @return array
     */
    public function getTurnSequence()
    {
        return $this->turnSequence;
    }

    /**
     * @return string
     */
    public function getActivePhase()
    {
        return $this->activePhase;
    }

    /**
     * @return bool
     */
    public function isPhaseGrow()
    {
        return $this->activePhase == self::PHASE_GROW;
    }

    /**
     * @return bool
     */
    public function isPhaseFeed()
    {
        return $this->activePhase == self::PHASE_FEED;
    }

    /**
     * @return Gamer[]
     */
    public function getGamers()
    {
        return $this->gamers;
    }

    /**
     * @return Gamer
     */
    public function getActiveGamer()
    {
        return $this->getGamerByIndex($this->activeGamerIndex);
    }

    /**
     * @param string $id
     * @return Gamer|null
     */
    public function getGamerById($id)
    {
        return $this->gamers[$id] ?? null;
    }

    /**
     * @param Gamer $gamer
     * @return int
     */
    public function getGamerIndex($gamer)
    {
        return array_search($gamer->getId(), $this->turnSequence);
    }

    /**
     * @param integer $index
     * @return Gamer
     */
    public function getGamerByIndex($index)
    {
        return $this->gamers[$this->turnSequence[$index]];
    }

    public function nextActiveGamer()
    {
        $current = $this->activeGamerIndex;

        $this->incActiveGamerIndex();
        while ($this->getActiveGamer()->isPassed()) {
            $this->incActiveGamerIndex();
            if ($this->activeGamerIndex == $current) {
                break;
            }
        }
        
        if ($this->isPhaseFeed()) {
            $this->getActiveGamer()->prepareToFeedTurn();
        }
    }

    /**
     * @return bool
     */
    public function checkGrowPhaseFinished()
    {
        foreach ($this->gamers as $gamer) {
            if (!$gamer->isPassed()) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return bool
     */
    public function checkFeedPhaseFinished()
    {
        foreach ($this->gamers as $gamer) {
            if ($this->gamerAllowedToEat($gamer) || $gamer->hasPotentialActivities()) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param Gamer $gamer
     * @return bool
     */
    public function gamerAllowedToEat($gamer)
    {
        if ($this->getFoodCount() == 0) {
            return false;
        }

        return $gamer->hasHungryCreature();
    }

    /**
     * @return int
     */
    public function getFoodCount()
    {
        return $this->foodCount;
    }

    /**
     * @return void
     */
    public function wasteFood()
    {
        if ($this->foodCount > 0) {
            $this->foodCount--;
        }
    }

    /**
     * @param Creature $creature
     * @return array|null
     */
    public function feedCreature($creature)
    {
        if ($this->getFoodCount() == 0) {
            return [];
        }

        $creature->getGamer()->onCreatureEaten();
        $feedReport = $creature->eat(self::FOOD_TYPE_RED);


        return $feedReport;
    }

    /**
     * @return bool
     */
    public function hasHungryCreature()
    {
        foreach ($this->gamers as $gamer) {
            if ($gamer->hasHungryCreature()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array
     */
    public function runExtinction()
    {
        $report = [];
        foreach ($this->gamers as $gamer) {
            $report[$gamer->getId()] = $gamer->runExtinction();
        }

        return $report;
    }

    /**
     * @return array
     */
    public function restorePropertiesState()
    {
        $result = [];
        foreach ($this->gamers as $gamer) {
            $report = $gamer->restorePropertiesState();
            if (!empty($report)) {
                $result[$gamer->getId()] = $report;
            }
        }
        return $result;
    }

    /**
     * @return array
     */
    public function calcScore()
    {
        $list = [];
        foreach ($this->gamers as $gamer) {
            $score = $gamer->calcScore();
            if (!array_key_exists($score, $list)) {
                $list[$score] = [];
            }
            $list[$score][] = [
                'gamerId' => $gamer->getId(),
                'dropping' => $gamer->getDropping(),
            ];
        }

        ksort($list);
        $list = array_reverse($list, true);
        foreach ($list as &$item) {
            usort($item, function ($a, $b) {
                if ($a['dropping'] > $b['dropping']) return -1;
                if ($a['dropping'] < $b['dropping']) return 1;
                return 0;
            });
        }
        unset($item);

        $result = [];
        foreach ($list as $score => $inScore) {
            foreach ($inScore as $data) {
                $result[] = [
                    'gamer' => $data['gamerId'],
                    'score' => $score,
                    'dropping' => $data['dropping'],
                ];
            }
        }
        return $result;
    }

    /**
     * @param string $gamerId
     * @return array
     */
    public function approveRevenge($gamerId)
    {
        if (!$this->isWaitingForRevenge) {
            return [];
        }
        
        $this->revengeApprovements[] = $gamerId;
        if (count($this->revengeApprovements) != $this->getGamersCount()) {
            return [
                'start' => false,
                'approvesCount' => count($this->revengeApprovements),
                'gamersCount' => $this->getGamersCount(),
            ];
        } else {
            return [
                'start' => true,
            ];
        }
    }

    /**
     * @param $gamerId
     */
    public function onGamerLeave($gamerId)
    {
        unset($this->gamers[$gamerId]);
        $this->getChannel()->trigger('gamer-leave', ['gamer' => $gamerId]);
    }


    /*******************************************************************************************************************
     * PRIVATE
     ******************************************************************************************************************/

    private function prepareCartPack()
    {
        if (is_null($this->cartPack)) {
            $this->cartPack = new CartPack();
        }

        $this->cartPack->reset();
    }

    private function prepareGamers()
    {
        if (empty($this->gamers)) {
            $connections = $this->getChannel()->getConnections();
            foreach ($connections as $connection) {
                $gamer = new Gamer($this, $connection);
                $this->gamers[$gamer->getId()] = $gamer;
            }
        } else {
            $this->turnSequence = [];
            foreach ($this->gamers as $gamer) {
                $gamer->reset();
            }
        }

        $this->updateGamersSequence();
    }

    /**
     * @param bool $shift
     * @throws Exception
     */
    private function updateGamersSequence($shift = false)
    {
        if (empty($this->turnSequence)) {
            $this->turnSequence = Math::shuffleArray(array_keys($this->gamers));
        } elseif ($shift) {
            $gamerId = array_shift($this->turnSequence);
            $this->turnSequence[] = $gamerId;
        }

        $this->activeGamerIndex = 0;
        if ($this->isPhaseFeed()) {
            $this->getActiveGamer()->prepareToFeedTurn();
        }
    }

    /**
     * @return array
     */
    private function distributeCarts()
    {
        $counters = [];
        $carts = [];
        foreach ($this->gamers as $gamerId => $gamer) {
            $counters[$gamerId] = $gamer->isEmpty() ? Constants::START_CARTS_COUNT : $gamer->getCreaturesCount() + 1;
            $carts[$gamerId] = [];
        }

        while (!empty($counters)) {
            if ($this->cartPack->isEmpty()) {
                break;
            }

            foreach ($this->gamers as $gamerId => $gamer) {
                if (!array_key_exists($gamerId, $counters)) {
                    continue;
                }

                $cart = $this->cartPack->handOverOne();
                $gamer->receiveCart($cart);
                $carts[$gamerId][] = $cart;
                $counters[$gamerId]--;
                if ($counters[$gamerId] == 0) {
                    unset($counters[$gamerId]);
                }

                if ($this->cartPack->isEmpty()) {
                    break;
                }
            }
        }

        return $carts;
    }

    private function incActiveGamerIndex()
    {
        $this->activeGamerIndex++;
        if ($this->activeGamerIndex == count($this->gamers)) {
            $this->activeGamerIndex = 0;
        }
    }
}
