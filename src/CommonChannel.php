<?php

namespace lexedo\games;

use lexedo\games\actions\ActionFactory;
use lx;
use lx\ModelInterface;
use lx\AuthenticationInterface;
use lx\socket\Channel\Channel;
use lx\socket\Channel\ChannelRequest;
use lx\socket\Channel\ChannelResponse;
use lx\socket\Connection;

class CommonChannel extends Channel
{
    /** @var array<Connection> */
    private array $userConnetionMap = [];
    private array $userList = [];
    private array $messageLog = [];
    private array $pendingGamesMap = [];
    /** @var array<GameChannel> */
    private array $stuffedGamesList = [];

    public static function getConfigProtocol(): array
    {
        return array_merge(parent::getConfigProtocol(), [
            'eventListener' => EventListener::class,
        ]);
    }

    public function getGamesProvider(): GamesProvider
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        /** @var GamesProvider $gamesProvider */
        $gamesProvider = $app->getService('lexedo/games')->gamesProvider;
        return $gamesProvider;
    }

    public function handleRequest(ChannelRequest $request): ChannelResponse
    {
        if ($request->getRoute() == 'test') {
            return $this->prepareResponse('ok');
        }
        
        $action = ActionFactory::getAction($this, $request);
        if (!$action) {
            return $this->prepareResponse('error');
        }
        
        $result = $action->run();
        return $this->prepareResponse($result);
    }

    /**
     * @return array<GameChannel>
     */
    public function getStuffedGames(): array
    {
        return $this->stuffedGamesList;
    }

    public function openPendingGame(GameChannel $gameChannel, array $users = []): void
    {
        $this->pendingGamesMap[$gameChannel->getName()] = [
            'channel' => $gameChannel,
            'users' => $users,
        ];
    }

    public function closePendingGame(GameChannel $gameChannel): void
    {
        if (array_key_exists($gameChannel->getName(), $this->pendingGamesMap)) {
            unset($this->pendingGamesMap[$gameChannel->getName()]);
        }
    }
    
    public function stuffPendingGame(GameChannel $gameChannel): void
    {
        if (array_key_exists($gameChannel->getName(), $this->pendingGamesMap)) {
            $this->stuffedGamesList[$gameChannel->getName()] = $gameChannel;
            unset($this->pendingGamesMap[$gameChannel->getName()]);
        }
    }

    public function closeGame(GameChannel $gameChannel): void
    {
        if (array_key_exists($gameChannel->getName(), $this->pendingGamesMap)) {
            unset($this->pendingGamesMap[$gameChannel->getName()]);
        } elseif (array_key_exists($gameChannel->getName(), $this->stuffedGamesList)) {
            unset($this->stuffedGamesList[$gameChannel->getName()]);
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

    /**
     * @return mixed
     */
    public function getUserAuthFieldByConnection(Connection $connection)
    {
        $user = $this->getUser($connection);
        /** @var lx\UserManagerInterface $userManager */
        $userManager = lx::$app->userManager;
        return $userManager->getAuthField($user);
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
    
    public function onConnect(Connection $connection): void
    {
        parent::onConnect($connection);

        $this->createEvent('new-user', $this->getCommonData($connection))
            ->setReceiver($connection)
            ->send();
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

    private function getCommonData(Connection $connection): array
    {
        $gamesProvider = $this->getGamesProvider();

        $currentGames = [];
        foreach ($this->pendingGamesMap as $gameData) {
            $users = $gameData['users'];
            if (!empty($users)) {
                $authField = $this->getUserAuthFieldByConnection($connection);
                if (!in_array($authField, $users)) {
                    continue;
                }
            }

            $game = $gameData['channel'];
            $parameters = $game->getParameters();
            $gameData = $gamesProvider->getGameData($parameters['type']);
            $currentGames[] = [
                'channelKey' => $game->getName(),
                'type' => $parameters['type'],
                'name' => $parameters['name'],
                'image' => $gameData['image'],
                'gamersCurrent' => $game->getConnectionsCount(),
                'gamersRequired' => $game->getNeedleGamersCount(),
            ];
        }

        return [
            'games' => $gamesProvider->getFullData(),
            'messages' => $this->messageLog,
            'currentGames' => $currentGames,
        ];
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
