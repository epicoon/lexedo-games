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
        $protocol = parent::getConfigProtocol();
        $protocol['eventListener'] = EventListener::class;
        return $protocol;
    }

    /**
     * @return array
     */
    public function getData()
    {
        $currentGames = [];
        /** @var GameChannel $item */
        foreach ($this->currentGamesList as $item) {
            $metaData = $item->getMetaData();
            $gameData = GamesProvider::getGameData($metaData['type']);
            $currentGames[] = [
                'channelKey' => $item->getName(),
                'type' => $metaData['type'],
                'name' => $metaData['name'],
                'image' => $gameData['image'],
                'gamersCurrent' => $item->getConnectionsCount(),
                'gamersRequired' => $item->getNeedleGamersCount(),
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
    public function addCurrentGame($gameChannel)
    {
        $this->currentGamesList[$gameChannel->getName()] = $gameChannel;
    }

    /**
     * @param GameChannel $gameChannel
     */
    public function delCurrentGame($gameChannel)
    {
        if (array_key_exists($gameChannel->getName(), $this->currentGamesList)) {
            unset($this->currentGamesList[$gameChannel->getName()]);
        }
    }

    /**
     * @param string $connectionId
     * @return ModelInterface
     */
    public function getUser($connectionId)
    {
        return $this->userList[$connectionId]['user'] ?? null;
    }

    /**
     * @param string $connectionId
     * @return array
     */
    public function getUserCookie($connectionId)
    {
        return $this->userList[$connectionId]['cookie'] ?? null;
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

        $cookie = $this->parseCookie($authData['cookie'] ?? '');

        $this->userList[$connection->getId()] = [
            'user' => $user,
            'cookie' => $cookie,
        ];
        return true;
    }

    /**
     * @param Connection $connection
     */
    public function onDisconnect(Connection $connection): void
    {
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
