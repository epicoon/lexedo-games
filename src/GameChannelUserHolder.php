<?php

namespace lexedo\games;

use lx\ModelInterface;
use lx\socket\Connection;

class GameChannelUserHolder
{
    /** @var array<GameChannelUser> */
    private array $userList = [];
    /** @var array<GameChannelUser> */
    private $usersWaitingList = [];
    /** @var array<GameChannelUser> */
    private array $disconnectedUsers = [];

    public function addWaitingUser(string $token, ModelInterface $user, string $type): void
    {
        $this->usersWaitingList[$token] = new GameChannelUser($user, $type);
    }

    public function getUser(Connection $connection): ?GameChannelUser
    {
        return $this->userList[$connection->getId()] ?? null;
    }

    public function userIsDisconnected(ModelInterface $user): bool
    {
        $user = $this->findUser($user);
        if (!$user) {
            return false;
        }
        return !$user->isConnected();
    }
    
    public function userIsObserver(ModelInterface $user): bool
    {
        $user = $this->findUser($user);
        if (!$user) {
            return false;
        }
        return $user->isObserver();
    }
    
    public function connectionIsObserver(Connection $connection): bool
    {
        $user = $this->getUser($connection);
        if (!$user) {
            return false;
        }
        return $user->isObserver();
    }

    public function acceptWaitingUser(Connection $connection, string $token): bool
    {
        if (!$this->checkWaitingUserByToken($token)) {
            return false;
        }

        $user = $this->usersWaitingList[$token];
        $user->connect($connection);
        $this->userList[$connection->getId()] = $user;
        unset($this->usersWaitingList[$token]);
        return true;
    }

    public function acceptDisconnectedUser(Connection $connection, string $oldConnectionId): bool
    {
        if (!array_key_exists($oldConnectionId, $this->disconnectedUsers)) {
            return false;
        }

        $user = $this->disconnectedUsers[$oldConnectionId];
        unset($this->disconnectedUsers[$oldConnectionId]);

        $user->connect($connection);
        $this->userList[$connection->getId()] = $user;
        return true;
    }

    public function disconnectUser(Connection $connection): void
    {
        $user = $this->userList[$connection->getId()] ?? null;
        if (!$user) {
            return;
        }

        unset($this->userList[$connection->getId()]);
        $user->disconnect();
        $this->disconnectedUsers[$connection->getId()] = $user;
    }

    public function dropUser(Connection $connection): void
    {
        $user = $this->userList[$connection->getId()] ?? null;

        unset($this->userList[$connection->getId()]);
        unset($this->disconnectedUsers[$connection->getId()]);
        if (!$user) {
            return;
        }

        if ($user) {
            $user->disconnect();
        }
    }

    private function findUser(ModelInterface $user): ?GameChannelUser
    {
        foreach ($this->userList as $item) {
            if ($item->getUser()->getId() === $user->getId()) {
                return $item;
            }
        }

        foreach ($this->usersWaitingList as $item) {
            if ($item->getUser()->getId() === $user->getId()) {
                return $item;
            }
        }

        foreach ($this->disconnectedUsers as $item) {
            if ($item->getUser()->getId() === $user->getId()) {
                return $item;
            }
        }

        return null;
    }

    private function checkWaitingUserByToken(?string $token): bool
    {
        if (!$token) {
            return false;
        }

        return array_key_exists($token, $this->usersWaitingList);
    }
}
