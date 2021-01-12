<?php

namespace lexedo\games\evolution\backend\game;

use lx\ModelInterface;
use lx\socket\Connection;

/**
 * Class Gamer
 * @package lexedo\games\evolution\backend\game
 */
class Gamer
{
    /** @var Game */
    private $game;

    /** @var Connection */
    private $connection;

    /** @var bool */
    private $isPassed;

    /** @var bool */
    private $canGetFood;

    /** @var Creature|null */
    private $creatureHasUsedFat;

    /** @var Cart[] */
    private $hand;

    /** @var Creature[] */
    private $creatures;

    /** @var int */
    private $droppingCounter;

    /**
     * Gamer constructor.
     * @param Game $game
     * @param Connection $connection
     */
    public function __construct($game, $connection)
    {
        $this->game = $game;
        $this->connection = $connection;
        $this->isPassed = false;

        $this->canGetFood = false;
        $this->creatureHasUsedFat = null;

        $this->hand = [];
        $this->creatures = [];
        $this->droppingCounter = 0;
    }

    public function reset()
    {
        $this->isPassed = false;
        $this->hand = [];
        $this->creatures = [];
        $this->droppingCounter = 0;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->connection->getId();
    }

    /**
     * @return ModelInterface
     */
    public function getUser()
    {
        return $this->getGame()->getChannel()->getUser($this->connection);
    }

    /**
     * @return Game
     */
    public function getGame()
    {
        return $this->game;
    }

    /**
     * @param bool $value
     */
    public function setPassed($value)
    {
        $this->isPassed = $value;
    }

    /**
     * @return bool
     */
    public function isPassed()
    {
        return $this->isPassed;
    }

    /**
     * @return bool
     */
    public function isActive()
    {
        return $this->getGame()->getActiveGamer() === $this;
    }

    /**
     * @return bool
     */
    public function isAvailableToFeedCreature()
    {
        return $this->canGetFood && ($this->creatureHasUsedFat === null);
    }

    /**
     * @param Creature $creature
     * @return bool
     */
    public function isAvailableToUseFat($creature)
    {
        return $this->canGetFood && ($this->creatureHasUsedFat === null || $this->creatureHasUsedFat === $creature);
    }

    /**
     * @return bool
     */
    public function mustEat()
    {
        return $this->canGetFood
            && $this->isActive()
            && $this->getGame()->isPhaseFeed()
            && $this->getGame()->getFoodCount()
            && $this->hasHungryCreature();
    }

    /**
     * @param Cart $cart
     */
    public function receiveCart($cart)
    {
        $this->hand[$cart->getId()] = $cart;
    }

    /**
     * @param Cart[] $carts
     */
    public function receiveCarts($carts)
    {
        $this->hand = array_merge($this->hand, $carts);
    }

    /**
     * @return int
     */
    public function getCartsCount()
    {
        return count($this->hand);
    }

    /**
     * @param int $id
     * @return Cart|null
     */
    public function getCartById($id)
    {
        return $this->hand[$id] ?? null;
    }

    /**
     * @return int
     */
    public function getHandCartsCount()
    {
        return count($this->hand);
    }

    /**
     * @param int $count
     */
    public function incDroppingCounter($count = 1)
    {
        $this->droppingCounter += $count;
    }

    /**
     * @return int
     */
    public function getDropping()
    {
        return $this->droppingCounter;
    }

    /**
     * @return int
     */
    public function getCreaturesCount()
    {
        return count($this->creatures);
    }

    /**
     * @return Creature[]
     */
    public function getCreatures()
    {
        return $this->creatures;
    }

    /**
     * @return bool
     */
    public function hasActivities()
    {
        if ($this->game->isPhaseGrow()) {
            return false;
        }

        foreach ($this->creatures as $creature) {
            if ($creature->hasActivities()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return bool
     */
    public function hasPotentialActivities()
    {
        if ($this->game->isPhaseGrow()) {
            return false;
        }

        foreach ($this->creatures as $creature) {
            if ($creature->hasPotentialActivities()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return bool
     */
    public function hasHungryCreature()
    {
        foreach ($this->creatures as $creature) {
            if ($creature->isHungry()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return bool
     */
    public function isEmpty()
    {
        return ($this->getCartsCount() == 0 && $this->getCreaturesCount() == 0);
    }

    /**
     * @param Cart $cart
     */
    public function dropCart($cart)
    {
        unset($this->hand[$cart->getId()]);
    }

    /**
     * @param Cart $cart
     * @return Creature
     */
    public function cartToCreature($cart)
    {
        $creature = new Creature($this);
        $this->creatures[$creature->getId()] = $creature;
        unset($this->hand[$cart->getId()]);
        return $creature;
    }

    /**
     * @param Creature $creature
     * @return array
     */
    public function dropCreature($creature)
    {
        if (!array_key_exists($creature->getId(), $this->creatures)) {
            return;
        }

        $relIds = $creature->dropRelPropertiesOnDie();
        $dropped = $creature->getCartCount();
        $this->incDroppingCounter($dropped);
        unset($this->creatures[$creature->getId()]);

        $result = [
            'dropping' => $dropped,
            'creatureId' => $creature->getId(),
        ];
        if (!empty($relIds)) {
            $result['relProps'] = $relIds;
        }

        return $result;
    }

    /**
     * @param $id
     * @return Creature|null
     */
    public function getCreatureById($id)
    {
        return $this->creatures[$id] ?? null;
    }

    /**
     * @return void
     */
    public function onCreatureEaten()
    {
        $this->canGetFood = false;
    }

    /**
     * @param Creature $creature
     */
    public function onCreatureUseFat($creature)
    {
        $this->canGetFood = false;
        $this->creatureHasUsedFat = $creature;
    }

    /**
     * @param Creature $carnival
     */
    public function onCreatureAttak($carnival)
    {
        $this->canGetFood = false;
    }

    /**
     * @param Creature $carnival
     * @return array|null
     */
    public function onCreatureSuccessfullAttak($carnival)
    {
        return $this->getGame()->onCreatureSuccessfullAttak($carnival);
    }

    /**
     * @return array
     */
    public function runExtinction()
    {
        $report = [
            'dropping' => 0,
            'creatures' => [],
            'properties' => [],
        ];

        foreach ($this->creatures as $creature) {
            $creature->trySurvive();

            if ($creature->mustDieOut()) {
                $creatureDropReport = $this->dropCreature($creature);
                $report['dropping'] += $creatureDropReport['dropping'];
                $report['creatures'][] = $creatureDropReport['creatureId'];
                if ($creatureDropReport['relProps'] ?? null) {
                    $report['properties'] = array_merge($report['properties'], $creatureDropReport['relProps']);
                }
                continue;
            }
        }

        return $report;
    }

    /**
     * @return void
     */
    public function prepareToFeedTurn()
    {
        $this->canGetFood = true;
        $this->creatureHasUsedFat = null;

        foreach ($this->creatures as $creature) {
            $creature->prepareToFeedTurn();
        }
    }

    /**
     * @return array
     */
    public function restorePropertiesState()
    {
        $result = [];
        foreach ($this->creatures as $creature) {
            $report = $creature->onFeedPhaseFinished();
            if (!empty($report)) {
                $result[$creature->getId()] = $report;
            }
        }
        return $result;
    }

    /**
     * @return int
     */
    public function calcScore()
    {
        $result = 0;
        foreach ($this->creatures as $creature) {
            $result += $creature->calcScore();
        }
        return $result;
    }
}
