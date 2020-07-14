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
     * @param string $commonConnectionId
     * @param ModelInterface $user
     */
    public function addUserWaiting($token, $commonConnectionId, $user)
    {
        $this->usersWaitingList[$token] = [$commonConnectionId, $user];
    }

    /**
     * @param Connection $connection
     * @return string
     */
    public function getConnectionCommonId($connection)
    {
        return $this->userList[$connection->getId()][0] ?? null;
    }

    /**
     * @param Connection $connection
     * @return ModelInterface
     */
    public function getUser($connection)
    {
        return $this->userList[$connection->getId()][1] ?? null;
    }

    /**
     * @return integer
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
            $this->app->getCommonChannel()->delCurrentGame($this);
            $this->isStuffed = true;
            $this->trigger('game-stuffed');
            $this->beginGame();
        } else {
            $event = $this->app->getCommonChannel()->createEvent('game-state-change', [
                'channel' => $this->getName(),
                'count' => $this->getConnectionsCount(),
            ]);
            $event->setDataForConnection($this->getConnectionCommonId($connection), [
                'follow' => true,
            ]);
            $this->app->getCommonChannel()->sendEvent($event);
        }
    }

    /**
     * @param Connection $connection
     */
    public function onDisconnect(Connection $connection): void
    {
        unset($this->userList[$connection->getId()]);

        parent::onDisconnect($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->delCurrentGame($this);
            $this->app->channels->close($this->getName());
        } else {
            $event = $this->app->getCommonChannel()->createEvent('game-state-change', [
                'channel' => $this->getName(),
                'count' => $this->getConnectionsCount(),
            ]);
            $event->setDataForConnection($this->getConnectionCommonId($connection), [
                'follow' => false,
            ]);
            $this->app->getCommonChannel()->sendEvent($event);
        }
    }
}
