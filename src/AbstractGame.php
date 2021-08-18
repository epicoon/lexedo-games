<?php

namespace lexedo\games;

use lx\Math;
use lx\Plugin;
use lx\socket\Channel\ChannelEvent;
use lx\socket\Connection;

abstract class AbstractGame
{
    protected GameChannel $channel;
    protected bool $isPending;
    protected bool $isActive;
    /** @var array<AbstractGamer> */
    protected array $gamers;
    protected array $userToGamerMap;
    protected bool $isWaitingForRevenge;
    protected array $revengeApprovements;
    protected Plugin $plugin;

    public function __construct(GameChannel $channel)
    {
        $this->channel = $channel;
        $this->isPending = true;
        $this->isActive = false;
        $this->gamers = [];
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];
    }

    abstract public function getCondition(): AbstractGameCondition;
    abstract public function fillEventBeginGame(ChannelEvent $event): void;
    abstract public function fillEventGameDataForGamer(ChannelEvent $event, AbstractGamer $gamer): void;
    abstract protected function getNewGamer(Connection $connection): AbstractGamer;

    public function getChannel(): GameChannel
    {
        return $this->channel;
    }

    public function getPlugin(): Plugin
    {
        return $this->plugin;
    }
    
    public function getType(): string
    {
        return $this->getChannel()->getParameter('type');
    }

    public function setPending(bool $pending): void
    {
        $this->isPending = $pending;
    }

    public function isPending(): bool
    {
        return $this->isPending;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function getGamersCount(): int
    {
        return count($this->gamers);
    }

    public function getNeedleGamersCount(): int
    {
        return $this->getChannel()->getNeedleGamersCount();
    }

    public function isWaitingForRevenge(): bool
    {
        return $this->isWaitingForRevenge;
    }
    
    public function getRevengeApprovements(): array
    {
        return $this->revengeApprovements;
    }

    /**
     * @return array<AbstractGamer>
     */
    public function getGamers(): array
    {
        return $this->gamers;
    }

    public function getGamerById(string $id): ?AbstractGamer
    {
        return $this->gamers[$id] ?? null;
    }

    public function getGamerByConnection(Connection $connection): ?AbstractGamer
    {
        return $this->getGamerById($this->userToGamerMap[$connection->getId()]);
    }
    
    public function createGamer(Connection $connection): AbstractGamer
    {
        $gamer = $this->getNewGamer($connection);
        $this->registerGamer($gamer);
        return $gamer;
    }

    public function registerGamer(AbstractGamer $gamer)
    {
        $id = Math::randHash();
        $gamer->setId($id);
        $this->userToGamerMap[$gamer->getConnectionId()] = $id;
        $this->gamers[$id] = $gamer;
    }
    
    public function actualizeGamerAfterReconnection(Connection $connection): bool
    {
        if (!array_key_exists($connection->getOldId(), $this->userToGamerMap)) {
            return false;
        }

        $id = $this->userToGamerMap[$connection->getOldId()];
        $gamer = $this->gamers[$id];
        
        $gamer->updateConnection($connection);
        unset($this->userToGamerMap[$connection->getOldId()]);
        $this->userToGamerMap[$connection->getId()] = $id;
        
        return true;
    }

    public function approveRevenge(string $gamerId): array
    {
        if (!$this->isWaitingForRevenge) {
            return [];
        }

        if (!in_array($gamerId, $this->revengeApprovements)) {
            $this->revengeApprovements[] = $gamerId;
        }
        if (count($this->revengeApprovements) != $this->getNeedleGamersCount()) {
            return [
                'start' => false,
                'approvesCount' => count($this->revengeApprovements),
                'gamersCount' => $this->getNeedleGamersCount(),
            ];
        } else {
            return [
                'start' => true,
            ];
        }
    }

    public function dropGamer(AbstractGamer $gamer): void
    {
        unset($this->userToGamerMap[$gamer->getConnectionId()]);
        unset($this->gamers[$gamerId]);
    }
}
