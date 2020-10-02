<?php

namespace lexedo\games;

use lx;
use lx\ModelInterface;
use lx\socket\Channel\Channel;
use lx\socket\Connection;

/**
 * Class CommonChannel
 * @package lexedo\games
 */
class CommonChannel extends Channel
{
    /** @var Connection[] */
    private $userConnetionMap = [];

    /** @var array  */
    private $userList = [];

    /** @var array  */
    private $messageLog = [];

    /** @var array  */
    private $currentGamesList = [];

    /**
     * @return array
     */
    public static function getConfigProtocol()
    {
        return array_merge(parent::getConfigProtocol(), [
            'eventListener' => EventListener::class,
        ]);
    }

    /**
     * @return array
     */
    public function getData()
    {
        $currentGames = [];
        /** @var GameChannel $game */
        foreach ($this->currentGamesList as $game) {
            $metaData = $game->getMetaData();
            $gameData = GamesProvider::getGameData($metaData['type']);
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
            'games' => GamesProvider::getFullData(),
            'messages' => $this->messageLog,
            'currentGames' => $currentGames,
        ];
    }

    /**
     * @param GameChannel $gameChannel
     */
    public function openWaitedGame($gameChannel)
    {
        $this->currentGamesList[$gameChannel->getName()] = $gameChannel;
    }

    /**
     * @param GameChannel $gameChannel
     */
    public function closeWaitedGame($gameChannel)
    {
        if (array_key_exists($gameChannel->getName(), $this->currentGamesList)) {
            unset($this->currentGamesList[$gameChannel->getName()]);
        }
    }

    /**
     * @param GameChannel $gameChannel
     * @param ModelInterface $user
     */
    public function onGameNewUser($gameChannel, $user)
    {
        $event = $this->createEvent('game-state-change', [
            'channel' => $gameChannel->getName(),
            'count' => $gameChannel->getConnectionsCount(),
        ]);

        $connection = $this->getConnectionForUser($user);
        $event->setDataForConnection($connection->getId(), [
            'follow' => true,
        ]);
        $this->sendEvent($event);
    }

    /**
     * @param GameChannel $gameChannel
     * @param ModelInterface $user
     */
    public function onGameLeaveUser($gameChannel, $user)
    {
        $event = $this->createEvent('game-state-change', [
            'channel' => $gameChannel->getName(),
            'count' => $gameChannel->getConnectionsCount(),
        ]);

        $connection = $this->getConnectionForUser($user);
        if ($connection) {
            $event->setDataForConnection($connection->getId(), [
                'follow' => false,
            ]);
        }

        $this->sendEvent($event);
    }

    /**
     * @param ModelInterface $user
     * @return Connection|null
     */
    public function getConnectionForUser($user)
    {
        if (!array_key_exists($user->id, $this->userConnetionMap)) {
            return null;
        }

        return $this->userConnetionMap[$user->id];
    }

    /**
     * @param Connection $connection
     * @return ModelInterface|null
     */
    public function getUser($connection)
    {
        return $this->userList[$connection->getId()]['user'] ?? null;
    }

    /**
     * @param ModelInterface $user
     * @return array
     */
    public function getUserCookie($user)
    {
        $connection = $this->getConnectionForUser($user);
        if (!$connection) {
            return [];
        }

        return $this->userList[$connection->getId()]['cookie'] ?? [];
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

        $user = lx::$app->authenticationGate->getUserModelByAccessToken($authData['auth']);
        if (!$user) {

            return false;
        }

        $this->userConnetionMap[$user->id] = $connection;
        $this->userList[$connection->getId()] = [
            'user' => $user,
            'cookie' => $this->parseCookie($authData['cookie'] ?? ''),
        ];
        return true;
    }

    /**
     * @param Connection $connection
     */
    public function onDisconnect(Connection $connection): void
    {
        $user = $this->getUser($connection);

        unset($this->userConnetionMap[$user->id]);
        unset($this->userList[$connection->getId()]);

        parent::onDisconnect($connection);
    }

    /**
     * @param string $cookieString
     * @return array
     */
    private function parseCookie($cookieString)
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
