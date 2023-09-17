<?php

namespace lexedo\games;

use lexedo\games\actions\ActionFactory;
use lexedo\games\admin\Admin;
use lexedo\games\commonRequestHandler\events\AdminEvent;
use lexedo\games\admin\AdminEventSender;
use lexedo\games\commonRequestHandler\RequestHandler;
use lexedo\games\commonRequestHandler\RequestVoter;
use lx;
use lx\ModelInterface;
use lx\AuthenticationInterface;
use lx\ResourceVoterInterface;
use lx\socket\channel\Channel;
use lx\socket\channel\request\ChannelRequest;
use lx\socket\channel\request\ChannelResponse;
use lx\socket\Connection;

class CommonChannel extends Channel
{
    /** @var array<Admin> */
    private array $adminsList = [];
    private AdminEventSender $adminEventSender;

    /** @var array<Connection> */
    private array $userConnetionMap = [];
    private array $userList = [];
    private array $messageLog = [];
    private array $pendingGamesMap = [];
    /** @var array<GameChannel> */
    private array $stuffedGamesList = [];
    protected ?ResourceVoterInterface $requestVoter = null;

    protected function init()
    {
        parent::init();
        $this->adminEventSender = new AdminEventSender($this);
    }

    public static function getDependenciesConfig(): array
    {
        return array_merge(parent::getDependenciesConfig(), [
            'eventListener' => EventListener::class,
            'requestVoter' => ResourceVoterInterface::class,
        ]);
    }

    public static function getDependenciesDefaultMap(): array
    {
        return [
            ResourceVoterInterface::class => RequestVoter::class,
        ];
    }

    public function getGamesProvider(): GamesProvider
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        /** @var GamesProvider $gamesProvider */
        $gamesProvider = $app->getService('lexedo/games')->gamesProvider;
        return $gamesProvider;
    }

    public function hasAdminConnection(Connection $connection): bool
    {
        return array_key_exists($connection->getId(), $this->adminsList);
    }

    /**
     * @return Admin[]
     */
    public function getAdminsList(): array
    {
        return $this->adminsList;
    }

    /**
     * @return Connection[]
     */
    public function getAdminConnections(): array
    {
        $connections = [];
        foreach ($this->adminsList as $admin) {
            $connections[] = $admin->getConnection();
        }
        return $connections;
    }

    public function handleRequest(ChannelRequest $request): ?ChannelResponse
    {
        if ($request->getRoute() == 'test') {
            return $this->prepareResponse('ok');
        }

        $requestHandler = new RequestHandler($this);
        $result = $requestHandler->handleRequest($request);
        if ($requestHandler->hasFlightRecords()) {
            return $this->prepareResponse([
                'success' => false,
                'error' => $requestHandler->getFirstFlightRecord(),
            ]);
        }

        if ($result === null) {
            return null;
        }

        return $this->prepareResponse($result);
    }

    public function sendAdminEvent(string $eventName, array $eventData = []): void
    {
        $this->adminEventSender->send($eventName, $eventData);
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
            $this->trigger('game-stuffed', [
                'channel' => $gameChannel->getName(),
            ]);

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
        $this->sendAdminEvent('gameChannelDropped', [
            'gameChannel' => $gameChannel,
        ]);;
    }

    public function onUserJoinGame(GameChannel $gameChannel, ModelInterface $user): void
    {
        $event = $this->createEvent('game-state-change', [
            'channel' => $gameChannel->getName(),
            'count' => $gameChannel->getGamersCount(),
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
            'count' => $gameChannel->getGamersCount(),
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
        if ($this->requirePassword() && !$this->checkPassword($authData['password'] ?? '')) {
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

        if (($authData['admin'] ?? null) === true) {
            if (!$this->requestVoter->run($user, 'admin')) {
                return false;
            }

            $this->adminsList[$connection->getId()] = new Admin(
                $user,
                $connection,
                $this->parseCookie($authData['cookie'] ?? '')
            );
            return true;
        }

        $userModel = $user->getModel();
        if (!$userModel) {
            return false;
        }

        $this->userConnetionMap[$userModel->getId()] = $connection;
        $this->userList[$connection->getId()] = [
            'user' => $userModel,
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

    public function onReconnect(Connection $connection): void
    {
        parent::onConnect($connection);

        $this->createEvent('new-user', $this->getCommonData($connection))
            ->setReceiver($connection)
            ->send();
    }

    public function onDisconnect(Connection $connection): void
    {
        if (array_key_exists($connection->getId(), $this->adminsList)) {
            unset($this->adminsList[$connection->getId()]);
        } else {
            $user = $this->getUser($connection);
            if ($user) {
                unset($this->userConnetionMap[$user->getId()]);
            }
            unset($this->userList[$connection->getId()]);
        }

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

            /** @var GameChannel $game */
            $game = $gameData['channel'];
            $parameters = $game->getParameters();
            $gameData = $gamesProvider->getGameData($parameters['type']);
            $currentGames[] = [
                'channelKey' => $game->getName(),
                'type' => $parameters['type'],
                'name' => $parameters['name'],
                'image' => $gameData['image'],
                'gamersCurrent' => $game->getGamersCount(),
                'gamersRequired' => $game->getNeedleGamersCount(),
                'requirePassword' => $game->requirePassword(),
            ];
        }

        $user = $this->getUser($connection);
        if ($user) {
            $cookie = $this->getUserCookie($user);
            $lang = $cookie['lang'] ?? 'en-EN';
        } else {
            $lang = 'en-EN';
        }

        return [
            'games' => $gamesProvider->getFullData($lang),
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
