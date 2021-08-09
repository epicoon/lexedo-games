<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\AbstractGamer;
use lx\socket\Connection;

/**
 * @property Game $game
 * @method Game getGame()
 */
class Gamer extends AbstractGamer
{
    private bool $isPassed;
    private bool $canGetFood;
    private int $droppingCounter;
    private ?Creature $creatureHasUsedFat;
    /** @var array<Cart> */
    private array $hand;
    /** @var array<Creature> */
    private array $creatures;

    public function __construct(Game $game, Connection $connection)
    {
        parent::__construct($game, $connection);

        $this->isPassed = false;
        $this->canGetFood = false;
        $this->droppingCounter = 0;

        $this->creatureHasUsedFat = null;
        $this->hand = [];
        $this->creatures = [];
    }

    public function toArray(): array
    {
        $carts = [];
        foreach ($this->hand as $cart) {
            $carts[] = $cart->getId();
        }
        $creatures = [];
        foreach ($this->creatures as $creature) {
            $creatures[] = $creature->getId();
        }
        return [
            'gamerId' => $this->getId(),
            'isPassed' => $this->isPassed,
            'canGetFood' => $this->canGetFood,
            'droppingCounter' => $this->droppingCounter,
            'carts' => $carts,
            'creatures' => $creatures,
        ];
    }

    public static function createFromArray(Game $game, Connection $connection, array $data): Gamer
    {
        $gamer = new self($game, $connection);
        $gamer->isPassed = $data['isPassed'];
        $gamer->canGetFood = $data['canGetFood'];
        $gamer->droppingCounter = $data['droppingCounter'];

        //TODO creatureHasUsedFat, creatures, carts

        return $gamer;
    }

    public function reset(): void
    {
        $this->isPassed = false;
        $this->hand = [];
        $this->creatures = [];
        $this->droppingCounter = 0;
    }

    public function setPassed(bool $value): void
    {
        $this->isPassed = $value;
    }

    public function isPassed(): bool
    {
        return $this->isPassed;
    }

    public function isActive(): bool
    {
        return $this->getGame()->getActiveGamer() === $this;
    }

    public function isAvailableToFeedCreature(): bool
    {
        return $this->canGetFood && ($this->creatureHasUsedFat === null);
    }

    public function isAvailableToUseFat(Creature $creature): bool
    {
        return $this->canGetFood && ($this->creatureHasUsedFat === null || $this->creatureHasUsedFat === $creature);
    }

    public function mustEat(): bool
    {
        return $this->canGetFood
            && $this->isActive()
            && $this->getGame()->isPhaseFeed()
            && $this->getGame()->getFoodCount()
            && $this->hasHungryCreature();
    }

    public function receiveCart(Cart $cart): void
    {
        $this->hand[$cart->getId()] = $cart;
    }

    /**
     * @param array<Cart> $carts
     */
    public function receiveCarts(array $carts): void
    {
        $this->hand = array_merge($this->hand, $carts);
    }

    public function getCartsCount(): int
    {
        return count($this->hand);
    }

    public function getCartById(int $id): ?Cart
    {
        return $this->hand[$id] ?? null;
    }

    public function getHandCartsCount(): int
    {
        return count($this->hand);
    }

    public function incDroppingCounter(int $count = 1): void
    {
        $this->droppingCounter += $count;
    }

    public function getDropping(): int
    {
        return $this->droppingCounter;
    }

    public function getCreaturesCount(): int
    {
        return count($this->creatures);
    }

    /**
     * @return array<Creature>
     */
    public function getCreatures(): array
    {
        return $this->creatures;
    }

    public function hasActivities(): bool
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

    public function hasPotentialActivities(): bool
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

    public function hasHungryCreature(): bool
    {
        foreach ($this->creatures as $creature) {
            if ($creature->isHungry()) {
                return true;
            }
        }

        return false;
    }

    public function isEmpty(): bool
    {
        return ($this->getCartsCount() == 0 && $this->getCreaturesCount() == 0);
    }

    public function dropCart(Cart $cart): void
    {
        unset($this->hand[$cart->getId()]);
    }

    public function cartToCreature(Cart $cart): Creature
    {
        $creature = $this->getGame()->getNewCreature($this);
        $this->creatures[$creature->getId()] = $creature;
        unset($this->hand[$cart->getId()]);
        return $creature;
    }

    public function dropCreature(Creature $creature): array
    {
        if (!array_key_exists($creature->getId(), $this->creatures)) {
            return [];
        }

        $relIds = $creature->dropRelPropertiesOnDie();
        $dropped = $creature->getCartCount();
        $this->incDroppingCounter($dropped);
        unset($this->creatures[$creature->getId()]);
        $this->getGame()->dropCreature($creature);

        $result = [
            'dropping' => $dropped,
            'creatureId' => $creature->getId(),
        ];
        if (!empty($relIds)) {
            $result['relProps'] = $relIds;
        }

        return $result;
    }

    public function getCreatureById(int $id): ?Creature
    {
        return $this->creatures[$id] ?? null;
    }

    public function onCreatureEaten(): void
    {
        $this->canGetFood = false;
    }

    public function onCreatureUseFat(Creature $creature): void
    {
        $this->canGetFood = false;
        $this->creatureHasUsedFat = $creature;
    }

    public function onCreatureAttak(Creature $carnival): void
    {
        $this->canGetFood = false;
    }

    public function onCreatureSuccessfullAttak(Creature $carnival): ?array
    {
        return $this->getGame()->onCreatureSuccessfullAttak($carnival);
    }

    public function runExtinction(): array
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

    public function prepareToFeedTurn(): void
    {
        $this->canGetFood = true;
        $this->creatureHasUsedFat = null;

        foreach ($this->creatures as $creature) {
            $creature->prepareToFeedTurn();
        }
    }

    public function restorePropertiesState(): array
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

    public function calcScore(): int
    {
        $result = 0;
        foreach ($this->creatures as $creature) {
            $result += $creature->calcScore();
        }
        return $result;
    }
}
