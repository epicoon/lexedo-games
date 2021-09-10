<?php

namespace lexedo\games\evolution\backend\game;

use lx\Math;

class CartPack
{
    private int $cartIdCounter;
    private int $index;
    /** @var array<Cart> */
    private array $carts;
    /** @var array<Cart> */
    private array $cartsMap;

    public function __construct()
    {
        $this->cartIdCounter = 1;
        $this->index = 0;
        $this->carts = [];
        for ($i=0; $i<4; $i++) {
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::BIG, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::HIDE, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::BIG, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::HIBERNATE, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::TRAMP, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::VENOM, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::INTERACT, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::PARASITE, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::PARASITE, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::ACUTE, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::HOLE, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::COOP, PropertyBank::CARNIVAL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::COOP, PropertyBank::FAT);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::FAST);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::SWIM);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::SWIM);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::MIMICRY);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::DROP_TAIL);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::SCAVENGER);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::PIRACY);
            $this->carts[] = new Cart($this->cartIdCounter++, PropertyBank::SYMBIOSIS);
        }

        $this->cartsMap = [];
        foreach ($this->carts as $cart) {
            $this->cartsMap[$cart->getId()] = $cart;
        }
    }
    
    public function getCart($id): ?Cart
    {
        return $this->cartsMap[$id] ?? null;
    }

    public function shuffle(): void
    {
        $this->carts = Math::shuffleArray($this->carts);
    }

    public function getIndex(): int
    {
        return $this->index;
    }

    public function getSequence(): array
    {
        $result = [];
        foreach ($this->carts as $cart) {
            $result[] = $cart->getId();
        }
        return $result;
    }

    public function set(array $cartsSequence, int $index): void
    {
        $this->index = $index;
        $carts = array_flip($cartsSequence);
        foreach ($this->carts as $cart) {
            $carts[$cart->getId()] = $cart;
        }
        $this->carts = array_values($carts);
    }

    public function reset(): void
    {
        $this->shuffle();
        $this->index = 0;
    }

    public function getCount(): int
    {
        return count($this->carts) - $this->index;
    }

    public function isEmpty(): bool
    {
        return ($this->getCount() === 0);
    }

    /**
     * @return array<Cart>
     */
    public function handOver(int $count): array
    {
        $result = [];
        $count = min($count, $this->getCount());
        for ($i=0; $i<$count; $i++) {
            $result[] = $this->carts[$this->index++];
        }
        return $result;
    }

    public function handOverOne(): ?Cart
    {
        $carts = $this->handOver(1);
        if (empty($carts)) {
            return null;
        }

        return $carts[0];
    }
}
