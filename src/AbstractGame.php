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

    const CONDITION_STATUS_PENDING = 'pending';
    const CONDITION_STATUS_STAFFED = 'staffed';
    const CONDITION_STATUS_ACTIVE = 'active';
    const CONDITION_STATUS_REVANGE = 'revange';

    private GamePlugin $_plugin;
    private GameChannel $_channel;

    private array $userToGamerMap;
    protected GamersList $gamers;

    protected bool $isPending;
    protected bool $isLoaded;
    protected string $conditionStatus;
    protected array $revengeApprovements;

    public function __construct()
    {
        $this->isPending = true;
        $this->isLoaded = false;
        $this->conditionStatus = self::CONDITION_STATUS_PENDING;
        $this->gamers = new GamersList();
        $this->revengeApprovements = [];
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * ABSTRACT
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    abstract public function getClassesMap(): array;
    abstract public function getCondition(): AbstractGameCondition;

    public function init(): void
    {
        // pass
    }

    protected function setFromCondition(AbstractGameCondition $condition): void
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

    protected function filterConditionForGamer(?AbstractGamer $gamer, AbstractGameCondition $condition): array
    {
        return $condition->toArray();
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * COMMON
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public function getConditionStatus(): string
    {
        return $this->conditionStatus;
    }

    public function loadFromCondition(AbstractGameCondition $condition): void
    {
        $this->isPending = true;
        $this->isLoaded = true;
        $this->conditionStatus = $condition->getConditionStatus();
        $this->revengeApprovements = $condition->getRevengeApprovements();
        $this->setFromCondition($condition);
    }

    protected function loadGamersFromCondition(AbstractGameCondition $condition): void
    {
        $gamers = $condition->getGamers();
        foreach ($gamers as $gamerData) {
            $authField = $gamerData['authField'];
            $gamerId = $gamerData['gamerId'];
            $gamer = $this->createGamerByAuthField($authField, $gamerId);
            $gamer->restore($gamerData);
        }
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
            'gameData' => $this->getConditionForGamer($gamer),
        ]);
    }

    public function prepareObserverConnectedEvent(ChannelEvent $event, Connection $connection): void
    {
        $event->addDataForConnection($connection, [
            'observerId' => $connection->getId(),
            'gamersData' => $this->getGamersData(),
            'gameData' => $this->getConditionForGamer(),
            'gameIsPending' => $this->isPending(),
        ]);
    }

    public function prepareLoadedEvent(ChannelEvent $event): void
    {
        foreach ($this->getGamers() as $gamer) {
            $event->addDataForConnection($gamer->getConnection(), [
                'gameData' => $this->getConditionForGamer($gamer)
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
        if (!$pending) {
            $this->conditionStatus = self::CONDITION_STATUS_STAFFED;
        }
    }

    public function isPending(): bool
    {
        return $this->isPending;
    }

    public function getGamersCount(): int
    {
        return $this->gamers->count();
    }

    public function getNeedleGamersCount(): int
    {
        return $this->getChannel()->getNeedleGamersCount();
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
        if ($this->conditionStatus !== self::CONDITION_STATUS_REVANGE) {
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

    private function getConditionForGamer(?AbstractGamer $gamer = null): array
    {
        if ($this->isPending()) {
            return [
                'conditionStatus' => self::CONDITION_STATUS_PENDING,
            ];
        }

        if ($this->conditionStatus === self::CONDITION_STATUS_REVANGE) {
            return [
                'conditionStatus' => self::CONDITION_STATUS_REVANGE,
                'approvesCount' => count($this->revengeApprovements),
                'gamersCount' => $this->getNeedleGamersCount(),
                'revengeApprovements' => $this->revengeApprovements,
            ];
        }

        $result = $this->filterConditionForGamer($gamer, $this->getCondition());
        $result['conditionStatus'] = self::CONDITION_STATUS_STAFFED;
        return $result;
    }
}
