<?php

namespace lexedo\games;

use lx;
use lx\Math;
use lexedo\games\GamePlugin;
use lx\socket\Channel\ChannelEvent;
use lx\socket\Connection;

abstract class AbstractGame
{
    const GAMER_CLASS = 'gamer';
    const CONDITION_CLASS = 'condition';

    private GamePlugin $_plugin;
    private GameChannel $_channel;

    private bool $isPending;
    private GamersList $gamers;
    private array $userToGamerMap;

    protected bool $isActive;
    protected bool $isWaitingForRevenge;
    protected array $revengeApprovements;

    public function __construct()
    {
        $this->isPending = true;
        $this->isActive = false;
        $this->gamers = new GamersList();
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];
    }

    abstract public function getClassesMap(): array;
    abstract public function getCondition(): AbstractGameCondition;
    abstract public function getGameDataForGamer(?AbstractGamer $gamer = null): array;

    public function beforeStaffed(): void
    {
        // pass
    }

    public function prepareStaffedEvent(ChannelEvent $event): void
    {
        // pass
    }

    public function beforeBegin(): void
    {
        // pass
    }

    public function prepareBeginEvent(ChannelEvent $event): void
    {
        // pass
    }

    public function beforeLoaded(): void
    {
        // pass
    }

    public function prepareLoadedEvent(ChannelEvent $event): void
    {
        foreach ($this->getGamers() as $gamer) {
            $gameData = $this->getGameDataForGamer($gamer);
            $event->addDataForConnection($gamer->getConnection(), ['gameData' => $gameData]);
        }
    }

    public function getConditionBlank(): AbstractGameCondition
    {
        $class = $this->getDependedClass(self::CONDITION_CLASS);
        return new $class($this);
    }

    public function setCondition(AbstractGameCondition $condition): void
    {
        $this->isPending = true;
        $this->isActive = $condition->getActive();
        $this->isWaitingForRevenge = $condition->getWaitingForRevenge();
        $this->revengeApprovements = $condition->getRevengeApprovements();
    }

    public function __get(string $name)
    {
        switch ($name) {
            case 'plugin': return $this->getPlugin();
            case 'channel': return $this->getChannel();
        }
        return null;
    }

    public function setChannel(GameChannel $channel): void
    {
        $this->_channel = $channel;
    }

    public function getChannel(): GameChannel
    {
        return $this->_channel;
    }

    public function setPlugin(GamePlugin $plugin): void
    {
        $this->_plugin = $plugin;
    }

    public function getPlugin(): GamePlugin
    {
        return $this->_plugin;
    }
    
    public function getType(): string
    {
        return $this->getChannel()->getParameter('type');
    }

    public function getDependedClass(string $key): ?string
    {
        if (!in_array($key, [self::GAMER_CLASS, self::CONDITION_CLASS])) {
            return null;
        }

        $map = $this->getClassesMap();
        return $map[$key] ?? null;
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

    public function getGamers(): GamersList
    {
        return $this->gamers;
    }

    public function getGamerById(string $id): ?AbstractGamer
    {
        return $this->gamers[$id] ?? null;
    }

    public function getGamerByConnection(Connection $connection): ?AbstractGamer
    {
        return $this->getGamerById(
            $this->userToGamerMap[$this->getUserAuthFieldByConnection($connection)]
        );
    }
    
    public function createGamerByConnection(Connection $connection): AbstractGamer
    {
        $gamer = $this->getNewGamer($connection);
        $this->registerGamer($gamer);
        return $gamer;
    }

    /**
     * @param mixed $authField
     */
    public function createGamerByAuthField($authField, string $id): AbstractGamer
    {
        $gamer = $this->getNewGamer(null, $authField);
        $this->registerGamer($gamer, $id);
        return $gamer;
    }

    /**
     * @param mixed $authField
     */
    public function registerGamer(AbstractGamer $gamer, ?string $id = null): void
    {
        if ($id === null) {
            $id = Math::randHash();
        }
        $gamer->setId($id);
        $authField = $gamer->getAuthField();
        $this->userToGamerMap[$authField] = $id;
        $this->gamers[$id] = $gamer;
    }
    
    public function actualizeGamerByConnection(Connection $connection): bool
    {
        $authField = $this->getUserAuthFieldByConnection($connection);
        if (!array_key_exists($authField, $this->userToGamerMap)) {
            return false;
        }

        $id = $this->userToGamerMap[$authField];
        $gamer = $this->gamers[$id];
        $gamer->updateByConnection($connection);
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
        $authField = $gamer->getAuthField();
        unset($this->userToGamerMap[$authField]);
        unset($this->gamers[$gamerId]);
    }

    /**
     * @return mixed
     */
    private function getUserAuthFieldByConnection(Connection $connection)
    {
        $user = $this->getChannel()->getUser($connection);
        /** @var lx\UserManagerInterface $userManager */
        $userManager = lx::$app->userManager;
        return $userManager->getAuthField($user);
    }

    private function getNewGamer(?Connection $connection = null, $authField = null): AbstractGamer
    {
        $class = $this->getDependedClass(self::GAMER_CLASS);
        return new $class($this, $connection, $authField);
    }
}
