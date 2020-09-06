<?php

namespace lexedo\games\evolution\backend\game;

use lx\Math;

/**
 * Class CartPack
 * @package lexedo\games\evolution\backend\game
 */
class CartPack
{
    /** @var integer */
    private $index;

    /** @var array */
    private $carts;

    /**
     * CartPack constructor.
     */
    public function __construct()
    {
        $this->index = 0;
        $this->carts = [];
        for ($i=0; $i<4; $i++) {
            $this->carts[] = new Cart(PropertyBank::BIG, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::HIDE, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::BIG, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart(PropertyBank::HIBERNATE, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart(PropertyBank::TRAMP, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::VENOM, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart(PropertyBank::INTERACT, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart(PropertyBank::PARASITE, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::PARASITE, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart(PropertyBank::ACUTE, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::HOLE, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::COOP, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart(PropertyBank::COOP, PropertyBank::FAT);
            $this->carts[] = new Cart(PropertyBank::FAST);
            $this->carts[] = new Cart(PropertyBank::SWIM);
            $this->carts[] = new Cart(PropertyBank::SWIM);
            $this->carts[] = new Cart(PropertyBank::MIMICRY);
            $this->carts[] = new Cart(PropertyBank::DROP_TAIL);
            $this->carts[] = new Cart(PropertyBank::SCAVENGER);
            $this->carts[] = new Cart(PropertyBank::PIRACY);
            $this->carts[] = new Cart(PropertyBank::SYMBIOSIS);
        }
    }

    public function shuffle()
    {
        $this->carts = Math::shuffleArray($this->carts);
    }

    public function reset()
    {
        $this->shuffle();
        $this->index = 0;
    }

    /**
     * @return int
     */
    public function getCount()
    {
        return count($this->carts) - $this->index;
    }

    /**
     * @return bool
     */
    public function isEmpty()
    {
        return ($this->getCount() === 0);
    }

    /**
     * @param integer $count
     * @return array
     */
    public function handOver($count)
    {
        $result = [];
        $count = min($count, $this->getCount());
        for ($i=0; $i<$count; $i++) {
            $result[] = $this->carts[$this->index++];
        }
        return $result;
    }

    /**
     * @return Cart|null
     */
    public function handOverOne()
    {
        $carts = $this->handOver(1);
        if (empty($carts)) {
            return null;
        }

        return $carts[0];
    }
}
