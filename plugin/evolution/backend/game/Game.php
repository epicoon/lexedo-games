<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\evolution\backend\EvolutionChannel;
use lx\Math;

/**
 * Class Game
 */
class Game
{
    const PHASE_GROW = 'grow';
    const PHASE_FEED = 'feed';

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

    /**
     * Game constructor.
     * @param EvolutionChannel $channel
     */
    public function __construct($channel)
    {
        $this->channel = $channel;
        $this->gamers = [];
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
                //TODO признак ошибочного вызова метода
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
     * @throws \Exception
     */
    public function prepareFeedPhase()
    {
        $this->foodCount = Math::rand(3, 8);
        foreach ($this->gamers as $gamer) {
            $gamer->setPassed(false);
        }
        $this->activePhase = self::PHASE_FEED;
    }

    /**
     * @return int
     */
    public function getFoodCount()
    {
        return $this->foodCount;
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
}
