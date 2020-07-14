<?php

namespace lexedo\games\evolution\backend\game;

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

    /** @var Cart[] */
    private $hand;

    /** @var Creature[] */
    private $creatures;

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

        $this->hand = [];
        $this->creatures = [];
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->connection->getId();
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
     * @return integer
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
     * @return integer
     */
    public function getHandCartsCount()
    {
        return count($this->hand);
    }

    /**
     * @return integer
     */
    public function getCreaturesCount()
    {
        return count($this->creatures);
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
     * @param $id
     * @return Creature|null
     */
    public function getCreatureById($id)
    {
        return $this->creatures[$id] ?? null;
    }
}
