<?php

namespace lexedo\games;

use lx\Plugin;
use lx\socket\Channel\ChannelEvent;

/**
 * Class AbstractGame
 * @package lexedo\games
 */
abstract class AbstractGame
{
    protected GameChannel $channel;
    protected bool $isPending;
    protected bool $isActive;
    /** @var array<AbstractGamer> */
    protected array $gamers;
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

    abstract public function fillEventBeginGame(ChannelEvent $event);
    abstract public function fillEventGameDataForGamer(ChannelEvent $event, string $gamreId);

    public function getChannel(): GameChannel
    {
        return $this->channel;
    }

    public function getPlugin(): Plugin
    {
        return $this->plugin;
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

    public function registerGamer(AbstractGamer $gamer)
    {
        $this->gamers[$gamer->getId()] = $gamer;
    }

    public function approveRevenge(string $gamerId): array
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

    public function onGamerLeave(string $gamerId)
    {
        unset($this->gamers[$gamerId]);
        $this->getChannel()->trigger('gamer-leave', ['gamer' => $gamerId]);
    }
}
