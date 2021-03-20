<?php

namespace lexedo\games;

use lx;
use lx\ModelInterface;
use lx\socket\Channel\Channel;
use lx\socket\Connection;

/**
 * Class GameChannel
 * @package lexedo\games
 */
abstract class GameChannel extends Channel
{
    protected GamesServer $app;
    /** @var array<ModelInterface> */
    protected $usersWaitingList = [];
    /** @var array<ModelInterface> */
    protected array $userList = [];
    protected bool $isStuffed = false;
    protected ?AbstractGame $game = null;

    /** @var array<ModelInterface> */
    private array $disconnectedUsers = [];

    /**
     * GameChannel constructor.
     * @param array $config
     */
    public function __construct($config = [])
    {
        parent::__construct($config);

        $this->app = lx::$app;
    }

    public function getGame(): AbstractGame
    {
        return $this->game;
    }

    /**
     * @return bool
     */
    public function isStuffed()
    {
        return $this->isStuffed;
    }

    /**
     * @param string $token
     * @param ModelInterface $user
     */
    public function addUserWaiting($token, $user)
    {
        $this->usersWaitingList[$token] = $user;
    }

    /**
     * @param Connection $connection
     * @return ModelInterface
     */
    public function getUser($connection)
    {
        return $this->userList[$connection->getId()] ?? null;
    }

    /**
     * @return int
     */
    public function getNeedleGamersCount()
    {
        return $this->metaData['gamersCount'];
    }

    /**
     * @param Connection $connection
     * @param mixed $authData
     * @return bool;
     */
    public function checkOnConnect($connection, $authData)
    {
        if ($this->requirePassword() && !$this->checkPassword($authData['password'] ?? null)) {
            return false;
        }

        $token = $authData['token'] ?? null;
        if (!$token || !array_key_exists($token, $this->usersWaitingList)) {
            return false;
        }

        $this->userList[$connection->getId()] = $this->usersWaitingList[$token];
        unset($this->usersWaitingList[$token]);
        return true;
    }

    public function checkOnReconnect($connection, $oldConnectionId, $authData)
    {
        if (!array_key_exists($oldConnectionId, $this->disconnectedUsers)) {
            return false;
        }

        $this->userList[$connection->getId()] = $this->disconnectedUsers[$oldConnectionId];
        unset($this->disconnectedUsers[$oldConnectionId]);
        return true;
    }

    public function onConnect(Connection $connection): void
    {
        parent::onConnect($connection);

        $this->timerOff();

        if ($this->getConnectionsCount() == $this->getNeedleGamersCount()) {
            $this->app->getCommonChannel()->trigger('game-stuffed', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closeWaitedGame($this);

            $this->isStuffed = true;
            $this->trigger('game-stuffed');

            $this->getGame()->setPending(false);
            $event = $this->createEvent('game-begin');
            $this->getGame()->fillEventBeginGame($event);
            $this->sendEvent($event);
        } else {
            $this->app->getCommonChannel()->onGameNewUser($this, $this->getUser($connection));
        }
    }

    public function onReconnect(Connection $connection): void
    {
        parent::onReconnect($connection);

        if ($this->getGame()->isPending()) {
            $this->app->getCommonChannel()->onGameNewUser($this, $this->getUser($connection));
        }

        $event = $this->createEvent('gamer-reconnected');
        $this->getGame()->fillEventGameDataForGamer($event, $connection->getId());
        $this->sendEvent($event);
    }

    public function onDisconnect(Connection $connection): void
    {
        parent::onDisconnect($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->timerOn();
        }

        $this->app->getCommonChannel()->onGameLeaveUser($this, $this->getUser($connection));
        $this->onGamerDisconnect($connection->getId());

        $this->disconnectedUsers[$connection->getId()] = $this->userList[$connection->getId()];
        unset($this->userList[$connection->getId()]);
    }

    public function onLeave(Connection $connection): void
    {
        parent::onLeave($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closeWaitedGame($this);
            $this->drop();
        } else {
            $this->app->getCommonChannel()->onGameLeaveUser($this, $this->getUser($connection));
            $this->onGamerDisconnect($connection->getId());
            unset($this->userList[$connection->getId()]);
        }
    }

    public function onIteration(): void
    {
        if ($this->getTimer() > $this->reconnectionPeriod) {
            $this->app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closeWaitedGame($this);
            $this->app->channels->close($this->getName());
        }
    }

    /**
     * @param string $gamerId
     */
    protected function onGamerDisconnected($gamerId)
    {
        // pass
    }
}
