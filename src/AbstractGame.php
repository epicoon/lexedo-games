<?php

namespace lexedo\games;

use lx;
use lx\Math;
use lx\ArrayHelper;
use lexedo\games\GamePlugin;
use lx\socket\channel\ChannelEvent;
use lx\socket\Connection;

abstract class AbstractGame
{
    const GAMER_CLASS = 'gamer';
    const CONDITION_CLASS = 'condition';

    const CONDITION_STATUS_PENDING = 'pending';
    const CONDITION_STATUS_PREPARING = 'preparing';
    const CONDITION_STATUS_PREPARED = 'prepared';
    const CONDITION_STATUS_ACTIVE = 'active';
    const CONDITION_STATUS_OVER = 'over';
    const CONDITION_STATUS_REVENGE = 'revenge';

    private GamePlugin $_plugin;
    private GameChannel $_channel;

    private array $userToGamerMap = [];
    protected GamersList $gamers;

    private bool $isStuffed;
    private bool $isLoaded;
    private string $conditionStatus;
    private ?string $prevConditionStatus;
    private array $revengeApprovements;

    public function __construct()
    {
        $this->isStuffed = false;
        $this->isLoaded = false;
        $this->prevConditionStatus = null;
        $this->conditionStatus = self::CONDITION_STATUS_PENDING;
        $this->gamers = new GamersList();
        $this->revengeApprovements = [];
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * ABSTRACT
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    abstract public function getClassesMap(): array;
    abstract public function getCondition(): AbstractGameCondition;

    protected function setFromCondition(AbstractGameCondition $condition): void
    {
        // pass
    }

    protected function filterConditionForGamer(?AbstractGamer $gamer, AbstractGameCondition $condition): array
    {
        return $condition->toArray();
    }

    public function init(): void
    {
        // pass
    }

    public function reset(): void
    {
        // pass
    }

    protected function prepare(): void
    {
        // pass
    }

    protected function prepareGamer(AbstractGamer $gamer): void
    {
        // pass
    }

    protected function getPrepareData(): iterable
    {
        return [];
    }

    protected function getGamerPrepareData(AbstractGamer $gamer): iterable
    {
        return [];
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
        $this->isStuffed = false;
        $this->isLoaded = true;
        $this->prevConditionStatus = null;
        $this->conditionStatus = $condition->getConditionStatus();
        $this->revengeApprovements = $condition->getRevengeApprovements();
        $this->setFromCondition($condition);
        if ($this->gamers->isEmpty()) {
            $this->loadGamersFromCondition($condition);
        }
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

    public function fillNewGamerEvent(ChannelEvent $event): void
    {
        $event->addData($this->getGamersData());
    }

    public function fillGamerReconnectedEvent(ChannelEvent $event, Connection $connection): void
    {
        $gamer = $this->getGamerByConnection($connection);
        $event->addData([
            'reconnectionData' => [
                'oldConnectionId' => $connection->getOldId(),
                'newConnectionId' => $connection->getId(),
                'gamerId' => $gamer->getId(),
                'gameIsStuffed' => $this->isStuffed(),
            ],
        ]);
        $event->setDataForConnection($connection, [
            'gamersData' => $this->getGamersData(),
            'gameData' => $this->getConditionForGamer($gamer),
        ]);
    }

    public function fillObserverConnectedEvent(ChannelEvent $event, Connection $connection): void
    {
        $event->addDataForConnection($connection, [
            'observerId' => $connection->getId(),
            'gamersData' => $this->getGamersData(),
            'gameData' => $this->getConditionForGamer(),
            'gameIsStuffed' => $this->isStuffed(),
        ]);
    }

    public function fillPreparedEvent(ChannelEvent $event): void
    {
        $event->addData(ArrayHelper::iterableToArray($this->getPrepareData()));

        foreach ($this->getGamers() as $gamer) {
            $data = ArrayHelper::iterableToArray($this->getGamerPrepareData($gamer));
            $user = $gamer->getGameChannelUser();
            $data['roleAroundGame'] = $user->getType();
            $event->addDataForConnection($gamer->getConnection(), $data);
        }
    }

    public function fillLoadedEvent(ChannelEvent $event): void
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

    public function setStuffed(): void
    {
        $this->isStuffed = true;
        if ($this->conditionStatus === self::CONDITION_STATUS_PENDING) {
            $this->setConditionStatus(self::CONDITION_STATUS_PREPARING);
        }
    }

    public function runPreparing(): void
    {
        $this->prepare();
        foreach ($this->getGamers() as $gamer) {
            $this->prepareGamer($gamer);
        }
        $this->setConditionStatus(self::CONDITION_STATUS_PREPARED);
    }

    public function setActive(): void
    {
        $this->setConditionStatus(self::CONDITION_STATUS_ACTIVE);
        $event = $this->getChannel()->createEvent('game-activated');
        $this->getChannel()->sendEvent($event);
    }

    public function setOver(): void
    {
        $this->setConditionStatus(self::CONDITION_STATUS_OVER);
        $event = $this->getChannel()->createEvent('game-over');
        $this->getChannel()->sendEvent($event);
    }

    public function setRevenge(string $initiatorId): void
    {
        $this->setConditionStatus(self::CONDITION_STATUS_REVENGE);
        foreach ($this->getGamers() as $gamer) {
            $user = $gamer->getGameChannelUser();
            if ($gamer->getId() == $initiatorId) {
                $user->setType(GameChannelUser::TYPE_AUTHOR);
            } else {
                $user->setType(GameChannelUser::TYPE_PARTICIPANT);
            }
        }
    }

    public function isStuffed(): bool
    {
        return $this->isStuffed;
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

    /**
     * @return GamersList&iterable<AbstractGamer>
     */
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

    public function approveRevenge(string $gamerId): void
    {
        if ($this->conditionStatus !== self::CONDITION_STATUS_REVENGE) {
            return;
        }
        $this->revengeApprovements[$gamerId] = true;

        $approves = 0;
        $votes = 0;
        foreach ($this->revengeApprovements as $vote) {
            $votes++;
            if ($vote) {
                $approves++;
            }
        }

        if ($approves == $this->getNeedleGamersCount()) {
            $this->revengeApprovements = [];
            $this->reset();
            $this->runPreparing();
            $event = $this->getChannel()->createEvent('game-prepared');
            $this->fillPreparedEvent($event);
            $event->send();
        } elseif ($votes == $this->getNeedleGamersCount()) {
            $this->setConditionStatus($this->prevConditionStatus);
        }
    }

    public function declineRevenge(string $gamerId): void
    {
        if ($this->conditionStatus !== self::CONDITION_STATUS_REVENGE) {
            return;
        }
        $this->revengeApprovements[$gamerId] = false;
    }

    public function getRevengeData(): array
    {
        return [
            'revengeApprovements' => $this->revengeApprovements,
        ];
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

    private function setConditionStatus(string $status): void
    {
        $this->prevConditionStatus = $this->conditionStatus;
        $this->conditionStatus = $status;
    }

    private function getConditionForGamer(?AbstractGamer $gamer = null): ?array
    {
        switch ($this->conditionStatus) {
            case self::CONDITION_STATUS_PENDING:
            case self::CONDITION_STATUS_PREPARING:
                return null;

            case self::CONDITION_STATUS_PREPARED:
                $result = ArrayHelper::iterableToArray($this->getPrepareData());
                if ($gamer) {
                    $data = ArrayHelper::iterableToArray($this->getGamerPrepareData($gamer));
                    $user = $gamer->getGameChannelUser();
                    $data['roleAroundGame'] = $user->getType();
                    $result = array_merge($result, $data);
                }
                $result['conditionStatus'] = $this->conditionStatus;
                return $result;

            case self::CONDITION_STATUS_ACTIVE:
                return $this->filterConditionForGamer($gamer, $this->getCondition());

            case self::CONDITION_STATUS_OVER:
                return ['conditionStatus' => $this->conditionStatus];

            case self::CONDITION_STATUS_REVENGE:
                $result = $this->getRevengeData();
                $result['conditionStatus'] = $this->conditionStatus;
                return $result;
        }
    }
}
