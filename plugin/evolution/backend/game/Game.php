<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\evolution\backend\EvolutionChannel;
use lx\Math;
use Exception;

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

    /** @var integer */
    private $foodCount;

    /** @var bool */
    private $isLastTurn;

    /** @var bool */
    private $isWaitingForRevenge;

    /** @var array */
    private $revengeApprovements;

    /**
     * Game constructor.
     * @param EvolutionChannel $channel
     */
    public function __construct($channel)
    {
        $this->channel = $channel;
        $this->gamers = [];

        $this->foodCount = 0;
        $this->isLastTurn = false;
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];
    }

    /**
     * @return EvolutionChannel
     */
    public function getChannel()
    {
        return $this->channel;
    }

    public function prepare()
    {
        $this->cartPack = new CartPack();
        $this->cartPack->shuffle();

        $sequence = [];

        $connections = $this->getChannel()->getConnections();
        foreach ($connections as $connection) {
            $gamer = new Gamer($this, $connection);
            $this->gamers[$gamer->getId()] = $gamer;
            $sequence[] = $gamer->getId();
        }

        $this->turnSequence = Math::shuffleArray($sequence);
        $this->activeGamerIndex = 0;
        $this->activePhase = self::PHASE_GROW;
    }

    /**
     * @return array
     */
    public function distributeCarts()
    {
        $neededPool = [];
        $gotPool = [];
        $maxNeeded = 0;

        $result = [];
        for ($i=0, $l=$this->getGamersCount(); $i<$l; $i++) {
            $gamer = $this->getGamerByIndex($i);
            $count = $gamer->isEmpty() ? Constants::START_CARTS_COUNT : $gamer->getCreaturesCount() + 1;
            if ($maxNeeded < $count) {
                $maxNeeded = $count;
            }
            $neededPool[$gamer->getId()] = $count;
            $gotPool[$gamer->getId()] = 0;
            $result[$gamer->getId()] = [];
        }

        for ($iterator=0; $iterator<$maxNeeded; $iterator++) {
            for ($i=0, $l=$this->getGamersCount(); $i<$l; $i++) {
                $gamer = $this->getGamerByIndex($i);
                if ($neededPool[$gamer->getId()] > $gotPool[$gamer->getId()]) {
                    $cart = $this->cartPack->handOverOne();
                    $gamer->receiveCart($cart);
                    $gotPool[$gamer->getId()]++;
                    $result[$gamer->getId()][] = $cart;
                }
            }
        }

        return $result;
    }

    /**
     * @return integer
     */
    public function getGamersCount()
    {
        return $this->channel->getNeedleGamersCount();
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
     * @return array
     */
    public function onFeedPhaseFinished()
    {
        $extinctionReport = $this->runExtinction();

        if ($this->isLastTurn) {
            $report = [
                'gameOver' => true,
                'extinction' => $extinctionReport,
                'result' => $this->calcScore(),
            ];
            $this->isWaitingForRevenge = true;
            $this->revengeApprovements = [];
        } else {
            $newTurnReport = $this->prepareGrowPhase();
            $report = array_merge(
                [
                    'gameOver' => false,
                    'extinction' => $extinctionReport,
                ],
                $newTurnReport
            );
        }

        return $report;
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

        return $gamer->canEat();
    }

    /**
     * @throws Exception
     */
    public function prepareFeedPhase()
    {
        $this->foodCount = Math::rand(3, 8);
        foreach ($this->gamers as $gamer) {
            $gamer->setPassed(false);
        }
        $this->activeGamerIndex = 0;
        $this->activePhase = self::PHASE_FEED;
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
        $this->foodCount--;
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

        $feedReport = $creature->eat(self::FOOD_TYPE_RED);


        return $feedReport;
    }

    /**
     * @param string $gamerId
     */
    public function approveRevenge($gamerId)
    {

        //TODO
        return false;
    }


    /*******************************************************************************************************************
     * PRIVATE
     ******************************************************************************************************************/

    private function incActiveGamerIndex()
    {
        $this->activeGamerIndex++;
        if ($this->activeGamerIndex == count($this->gamers)) {
            $this->activeGamerIndex = 0;
        }
    }

    /**
     * @return array
     */
    private function runExtinction()
    {
        $report = [];
        foreach ($this->gamers as $gamer) {
            $report[$gamer->getId()] = $gamer->onFeedPhaseFinished();
        }

        return $report;
    }

    /**
     * @return array
     */
    private function prepareGrowPhase()
    {
        $report = [
            'carts' => $this->distributeCarts(),
        ];

        if ($this->cartPack->isEmpty()) {
            $this->isLastTurn = true;
            $report['isLastTurn'] = $this->isLastTurn;
        }

        $this->foodCount = 0;
        foreach ($this->gamers as $gamer) {
            $gamer->setPassed(false);
        }
        $this->activeGamerIndex = 0;
        $this->activePhase = self::PHASE_GROW;

        $gamerId = array_shift($this->turnSequence);
        $this->turnSequence[] = $gamerId;

        $report['activePhase'] = $this->activePhase;
        $report['turnSequence'] = $this->turnSequence;

        return $report;
    }

    /**
     * @return array
     */
    private function calcScore()
    {
        $list = [];
        foreach ($this->gamers as $gamer) {
            $score = $gamer->calcScore();
            if (!array_key_exists($score, $list)) {
                $list[$score] = [];
            }
            $list[$score][$gamer->getDropping()] = $gamer->getId();
        }

        ksort($list);
        $list = array_reverse($list, true);
        foreach ($list as &$item) {
            ksort($item);
            $item = array_reverse($item, true);
        }
        unset($item);

        $result = [];
        foreach ($list as $score => $droppings) {
            foreach ($droppings as $dropping => $gamerId) {
                $result[] = [
                    'gamer' => $gamerId,
                    'score' => $score,
                    'dropping' => $dropping,
                ];
            }
        }
        return $result;
    }
}
