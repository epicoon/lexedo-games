<?php

namespace lexedo\games;

use lx\ModelInterface;
use lx\socket\Connection;

class GameChannelUserHolder
{
    /** @var array<ModelInterface> */
    private array $userList = [];
    /** @var array<ModelInterface> */
    private array $observerUsers = [];
    /** @var array<array{'user':ModelInterface, 'isObserver':bool}> */
    private $usersWaitingList = [];
    /** @var array<array{'user':ModelInterface, 'isObserver':bool}> */
    private array $disconnectedUsers = [];

    public function addWaitingUser(string $token, ModelInterface $user, bool $isObserver = false): void
    {
        $this->usersWaitingList[$token] = [
            'user' => $user,
            'isObserver' => $isObserver,
        ];
    }

    public function getUser(Connection $connection): ?ModelInterface
    {
        return $this->userList[$connection->getId()] ?? null;
    }

    public function userIsDisconnected(ModelInterface $user): bool
    {
        foreach ($this->disconnectedUsers as $pare) {
            if ($pare['user'] === $user) {
                return true;
            }
        }

        return false;
    }
    
    public function userIsObserver(ModelInterface $user): bool
    {
        if (array_key_exists($user->getId(), $this->observerUsers)) {
            return true;
        }

        foreach ($this->disconnectedUsers as $pare) {
            if ($pare['user'] === $user) {
                return $pare['isObserver'];
            }
        }

        return false;
    }
    
    public function connectionIsObserver(Connection $connection): bool
    {
        $user = $this->getUser($connection);
        if (!$user) {
            return false;
        }
        
        return $this->userIsObserver($user);
    }

    public function acceptWaitingUser(Connection $connection, string $token): bool
    {
        if (!$this->checkWaitingUserByToken($token)) {
            return false;
        }

        /** @var ModelInterface $user */
        $user = $this->usersWaitingList[$token]['user'];
        $this->userList[$connection->getId()] = $user;
        if ($this->usersWaitingList[$token]['isObserver']) {
            $this->observerUsers[$user->getId()] = $user;
        }
        unset($this->usersWaitingList[$token]);
        return true;
    }

    public function acceptDisconnectedUser(Connection $connection, string $oldConnectionId): bool
    {
        if (!array_key_exists($oldConnectionId, $this->disconnectedUsers)) {
            return false;
        }

        $pare = $this->disconnectedUsers[$oldConnectionId];
        unset($this->disconnectedUsers[$oldConnectionId]);

        /** @var ModelInterface $user */
        $user = $pare['user'];
        $this->userList[$connection->getId()] = $user;
        if ($pare['isObserver']) {
            $this->observerUsers[$user->getId()] = $user;
        }
        return true;
    }

    public function disconnectUser(Connection $connection): void
    {
        $user = $this->userList[$connection->getId()];
        unset($this->userList[$connection->getId()]);

        $isObserver = array_key_exists($user->getId(), $this->observerUsers);
        if ($isObserver) {
            unset($this->observerUsers[$user->getId()]);
        }
        $this->disconnectedUsers[$connection->getId()] = [
            'user' => $user,
            'isObserver' => $isObserver,
        ];
    }

    public function dropUser(Connection $connection): void
    {
        $user = $this->userList[$connection->getId()] ?? null;
        unset($this->userList[$connection->getId()]);
        unset($this->disconnectedUsers[$connection->getId()]);
        if ($user) {
            unset($this->observerUsers[$user->getId()]);
        }
    }

    private function checkWaitingUserByToken(?string $token): bool
    {
        if (!$token) {
            return false;
        }

        return array_key_exists($token, $this->usersWaitingList);
    }
}
