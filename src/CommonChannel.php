<?php

namespace lexedo\games;

use lx;
use lx\ModelInterface;
use lx\AuthenticationInterface;
use lx\socket\Channel\Channel;
use lx\socket\Connection;

class CommonChannel extends Channel
{
    /** @var array<Connection> */
    private array $userConnetionMap = [];
    private array $userList = [];
    private array $messageLog = [];
    private array $currentGamesList = [];

    public static function getConfigProtocol(): array
    {
        return array_merge(parent::getConfigProtocol(), [
            'eventListener' => EventListener::class,
        ]);
    }

    public function getData(): array
    {
        /** @var GamesServer $app */
        $app = lx::$app;

        $currentGames = [];
        /** @var GameChannel $game */
        foreach ($this->currentGamesList as $game) {
            $metaData = $game->getMetaData();
            $gameData = $app->getService('lexedo/games')->gamesProvider->getGameData($metaData['type']);
            $currentGames[] = [
                'channelKey' => $game->getName(),
                'type' => $metaData['type'],
                'name' => $metaData['name'],
                'image' => $gameData['image'],
                'gamersCurrent' => $game->getConnectionsCount(),
                'gamersRequired' => $game->getNeedleGamersCount(),
            ];
        }

        return [
            'games' => $app->getService('lexedo/games')->gamesProvider->getFullData(),
            'messages' => $this->messageLog,
            'currentGames' => $currentGames,
        ];
    }

    public function openWaitedGame(GameChannel $gameChannel): void
    {
        $this->currentGamesList[$gameChannel->getName()] = $gameChannel;
    }

    public function closeWaitedGame(GameChannel $gameChannel): void
    {
        if (array_key_exists($gameChannel->getName(), $this->currentGamesList)) {
            unset($this->currentGamesList[$gameChannel->getName()]);
        }
    }

    public function onUserJoinGame(GameChannel $gameChannel, ModelInterface $user): void
    {
        $event = $this->createEvent('game-state-change', [
            'channel' => $gameChannel->getName(),
            'count' => $gameChannel->getConnectionsCount(),
        ]);

        $connection = $this->getConnectionForUser($user);
        $event->setDataForConnection($connection, [
            'follow' => true,
        ]);
        $this->sendEvent($event);
    }

    public function onUserLeaveGame(GameChannel $gameChannel, ModelInterface $user): void
    {
        $event = $this->createEvent('game-state-change', [
            'channel' => $gameChannel->getName(),
            'count' => $gameChannel->getConnectionsCount(),
        ]);

        $connection = $this->getConnectionForUser($user);
        if ($connection) {
            $event->setDataForConnection($connection, [
                'follow' => false,
            ]);
        }

        $this->sendEvent($event);
    }

    public function getConnectionForUser(ModelInterface $user): ?Connection
    {
        if (!array_key_exists($user->getId(), $this->userConnetionMap)) {
            return null;
        }

        return $this->userConnetionMap[$user->getId()];
    }

    public function getUser(Connection $connection): ?ModelInterface
    {
        return $this->userList[$connection->getId()]['user'] ?? null;
    }

    public function getUserCookie(ModelInterface $user): array
    {
        $connection = $this->getConnectionForUser($user);
        if (!$connection) {
            return [];
        }

        return $this->userList[$connection->getId()]['cookie'] ?? [];
    }

    public function checkOnConnect(Connection $connection, array $authData): bool
    {
        if ($this->requirePassword() && !$this->checkPassword($authData['password'] ?? null)) {
            return false;
        }
        
        /** @var AuthenticationInterface $gate */
        $gate = lx::$app->authenticationGate;
        if (!$gate) {
            return false;
        }

        $user = $gate->authenticateUser(['accessToken' => $authData['auth']]);
        if (!$user) {
            return false;
        }
        $user = $user->getModel();
        if (!$user) {
            return false;
        }

        $this->userConnetionMap[$user->getId()] = $connection;
        $this->userList[$connection->getId()] = [
            'user' => $user,
            'cookie' => $this->parseCookie($authData['cookie'] ?? ''),
        ];

        return true;
    }

    public function onDisconnect(Connection $connection): void
    {
        $user = $this->getUser($connection);
        if ($user) {
            unset($this->userConnetionMap[$user->getId()]);
        }

        unset($this->userList[$connection->getId()]);

        parent::onDisconnect($connection);
    }

    private function parseCookie(string $cookieString): array
    {
        preg_match_all('/([^:]+?)=(.+?)(?:;|$)/', $cookieString, $matches);
        if (empty($matches[0])) {
            return [];
        }

        $result = [];
        foreach ($matches[0] as $i => $match) {
            $result[trim($matches[1][$i], ' ')] = trim($matches[2][$i], ' ');
        }

        return $result;
    }
}
