<?php

namespace lexedo\games;

use lx;
use lx\Math;
use lexedo\games\GamePlugin;
use lx\socket\channel\ChannelEvent;
use lx\socket\Connection;

abstract class AbstractGame
{
    const GAMER_CLASS = 'gamer';
    const CONDITION_CLASS = 'condition';

    const RECONNECTION_STATUS_PENDING = 'pending';
    const RECONNECTION_STATUS_STAFFED = 'staffed';
    const RECONNECTION_STATUS_REVANGE = 'revange';

    private GamePlugin $_plugin;
    private GameChannel $_channel;

    private bool $isPending;
    private GamersList $gamers;
    private array $userToGamerMap;

    protected bool $isActive;
    protected bool $isLoaded;
    protected bool $isWaitingForRevenge;
    protected array $revengeApprovements;

    public function __construct()
    {
        $this->isPending = true;
        $this->isActive = false;
        $this->isLoaded = false;
        $this->gamers = new GamersList();
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];
        $this->init();
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * ABSTRACT
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    abstract public function getClassesMap(): array;
    abstract public function getCondition(): AbstractGameCondition;

    protected function init(): void
    {
        // pass
    }

    public function beforeStaffed(): void
    {
        // pass
    }

    public function afterStaffed(): void
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

    public function afterBegin(): void
    {
        // pass
    }

    public function prepareBeginEvent(ChannelEvent $event): void
    {
        // pass
    }

    protected function setFromCondition(AbstractGameCondition $condition): void
    {

    }

    protected function filterConditionForGamer(?AbstractGamer $gamer, AbstractGameCondition $condition): array
    {
        return $condition->toArray();
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * COMMON
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public function loadFromCondition(AbstractGameCondition $condition): void
    {
        $this->isPending = true;
        $this->isLoaded = true;
        $this->isActive = $condition->getActive();
        $this->isWaitingForRevenge = $condition->getWaitingForRevenge();
        $this->revengeApprovements = $condition->getRevengeApprovements();
        $this->setFromCondition($condition);
    }

    public function prepareNewGamerEvent(ChannelEvent $event): void
    {
        $event->addData($this->getGamersData());
    }

    public function prepareGamerReconnectedEvent(ChannelEvent $event, Connection $connection): void
    {
        $gamer = $this->getGamerByConnection($connection);
        $event->addData([
            'reconnectionData' => [
                'oldConnectionId' => $connection->getOldId(),
                'newConnectionId' => $connection->getId(),
                'gamerId' => $gamer->getId(),
                'gameIsPending' => $this->isPending(),
            ],
        ]);
        $event->setDataForConnection($connection, [
            'gamersData' => $this->getGamersData(),
            'gameData' => $this->getGameDataForGamer($gamer),
        ]);
    }

    public function prepareObserverJoinedEvent(ChannelEvent $event, Connection $connection): void
    {
        //TODO сейчас посылается только наблюдателю, остальные не видят, что присоединился наблюдатель
        $event->setReceiver($connection);
        $event->addDataForConnection($connection, [
            'gamersData' => $this->getGamersData(),
            'gameData' => $this->getGameDataForGamer(),
            'gameIsPending' => $this->isPending(),
        ]);
    }

    public function prepareLoadedEvent(ChannelEvent $event): void
    {
        foreach ($this->getGamers() as $gamer) {
            $event->addDataForConnection($gamer->getConnection(), [
                'gameData' => $this->getGameDataForGamer($gamer)
            ]);
        }
    }

    public function getConditionBlank(): AbstractGameCondition
    {
        $class = $this->getDependedClass(self::CONDITION_CLASS);
        return new $class($this);
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

    /**
     * @param mixed $authField
     */
    public function createGamerByAuthField($authField, string $id): AbstractGamer
    {
        $gamer = $this->getNewGamer(null, $authField);
        $this->registerGamer($gamer, $id);
        return $gamer;
    }

    public function promiseGamerForConnection(Connection $connection): bool
    {
        if ($this->getChannel()->isLoaded()) {
            return $this->actualizeGamerByConnection($connection);
        }

        $gamer = $this->getNewGamer($connection);
        $this->registerGamer($gamer);
        return true;
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


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * PRIVATE
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

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

    private function getGamersData(): array
    {
        $gamers = $this->getGamers();
        $list = [];
        foreach ($gamers as $gamer) {
            $connectionId = $gamer->getConnectionId();
            if (!$connectionId) {
                continue;
            }

            $list[] = [
                'connectionId' => $connectionId,
                'gamerId' => $gamer->getId(),
            ];
        }
        return $list;
    }

    private function getGameDataForGamer(?AbstractGamer $gamer = null): array
    {
        if ($this->isPending()) {
            return [
                'type' => self::RECONNECTION_STATUS_PENDING,
            ];
        }

        if ($this->isWaitingForRevenge) {
            return [
                'type' => self::RECONNECTION_STATUS_REVANGE,
                'approvesCount' => count($this->revengeApprovements),
                'gamersCount' => $this->getNeedleGamersCount(),
                'revengeApprovements' => $this->revengeApprovements,
            ];
        }

        return [
            'type' => self::RECONNECTION_STATUS_STAFFED,
            'condition' => $this->filterConditionForGamer($gamer, $this->getCondition()),
        ];
    }
}
