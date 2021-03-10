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
    /** @var GamesServer */
    protected $app;

    /** @var array */
    protected $usersWaitingList = [];

    /** @var array */
    protected $userList = [];

    /** @var bool */
    protected $isStuffed = false;

    /**
     * GameChannel constructor.
     * @param array $config
     */
    public function __construct($config = [])
    {
        parent::__construct($config);

        $this->app = lx::$app;
    }

    abstract protected function beginGame();

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
    public function checkAuthData($connection, $authData)
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

    /**
     * @param Connection $connection
     */
    public function onConnect(Connection $connection): void
    {
        parent::onConnect($connection);

        if ($this->getConnectionsCount() == $this->getNeedleGamersCount()) {
            $this->app->getCommonChannel()->trigger('game-stuffed', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closeWaitedGame($this);
            $this->isStuffed = true;
            $this->trigger('game-stuffed');
            $this->beginGame();
        } else {
            $this->app->getCommonChannel()->onGameNewUser($this, $this->getUser($connection));
        }
    }

    /**
     * @param Connection $connection
     */
    public function onDisconnect(Connection $connection): void
    {
        parent::onDisconnect($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closeWaitedGame($this);
            $this->app->channels->close($this->getName());
        } else {
            $this->app->getCommonChannel()->onGameLeaveUser($this, $this->getUser($connection));
            $this->onGamerDisconnect($connection->getId());
        }

        unset($this->userList[$connection->getId()]);
    }

    /**
     * @param string $gamerId
     */
    protected function onGamerDisconnect($gamerId)
    {
        // pass
    }
}
