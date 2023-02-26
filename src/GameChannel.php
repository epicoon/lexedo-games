<?php

namespace lexedo\games;

use lexedo\games\models\GamerInGame;
use lexedo\games\models\GameSave;
use lx;
use lx\ModelInterface;
use lx\socket\channel\Channel;
use lx\socket\channel\request\ChannelRequest;
use lx\socket\channel\request\ChannelResponse;
use lx\socket\Connection;

abstract class GameChannel extends Channel
{
    protected bool $isStuffed = false;
    protected ?GamePlugin $plugin = null;
    protected ?AbstractGame $game = null;
    private GameChannelUserHolder $users;

    protected function init(): void
    {
        parent::init();

        $this->users = new GameChannelUserHolder();
        if ($this->game) {
            $this->game->setPlugin($this->plugin);
            $this->game->setChannel($this);
        }

        if ($this->getParameter('loadingMode')) {
            $conditionClass = $this->game->getDependedClass(AbstractGame::CONDITION_CLASS);
            /** @var AbstractGameCondition $condition */
            $condition = new $conditionClass();
            $condition->initByString($this->getParameter('condition'));
            $this->game->loadFromCondition($condition);
        }
    }

    public static function getDependenciesConfig(): array
    {
        return array_merge(parent::getDependenciesConfig(), [
            'plugin' => GamePlugin::class,
        ]);
    }

    public function getType(): string
    {
        return $this->getParameter('type');
    }

    public function isLoaded(): bool
    {
        return $this->getParameter('loadingMode');
    }

    public function getCurrentGameName(): string
    {
        return $this->getParameter('name');
    }

    public function getGamePlugin(): GamePlugin
    {
        return $this->plugin;
    }

    public function getGame(): AbstractGame
    {
        return $this->game;
    }

    public function getGameReferences(): array
    {
        return [];
    }
    
    public function getGamersCount(): int
    {
        $count = $this->getConnectionsCount();
        foreach ($this->connections as $connection) {
            if ($this->users->connectionIsObserver($connection)) {
                $count--;
            }
        }
        return $count;
    }

    public function handleRequest(ChannelRequest $request): ?ChannelResponse
    {
        if ($request->getRoute() == 'saveGame') {
            $data = $request->getData();
            $gameName = $data['gameName'];

            $game = $this->getGame();

            $gameSave = GameSave::findOne([
                'gameType' => $game->getType(),
                'name' => $gameName,
            ]);
            if (!$gameSave) {
                $gameSave = new GameSave();
            }

            $gameSave->gameType = $game->getType();
            $gameSave->name = $gameName;
            $gameSave->date = new \DateTime();
            $gameSave->data = $game->getCondition()->toString();

            $gamersInGame = [];
            if ($gameSave->isNew()) {
                $gamers = $game->getGamers();
                foreach ($gamers as $gamer) {
                    $gamerInGame = new GamerInGame();
                    $gamerInGame->userAuthValue = $gamer->getAuthField();
                    $gamerInGame->gamerId = $gamer->getId();
                    if ($request->getInitiator()->getId() == $gamer->getConnectionId()) {
                        $gamerInGame->isHolder = true;
                    }
                    $gamerInGame->gameSave = $gameSave;
                    $gamersInGame[] = $gamerInGame;
                }
            }
            //TODO else - обновить холдеров

            $gameSave->save();

            return $this->prepareResponse(true);
        }

        return $this->prepareResponse([]);
    }

    public function isStuffed(): bool
    {
        return $this->isStuffed;
    }

    public function addWaitingUser(string $token, ModelInterface $user, string $type): void
    {
        $this->users->addWaitingUser($token, $user, $type);
    }

    public function getGameChannelUser(Connection $connection): ?GameChannelUser
    {
        return $this->users->getUser($connection);
    }

    public function getUser(Connection $connection): ?ModelInterface
    {
        $user = $this->users->getUser($connection);
        if (!$user) {
            return null;
        }
        return $user->getUser();
    }

    public function connectionIsObserver(Connection $connection): bool
    {
        return $this->users->connectionIsObserver($connection);
    }

    public function getNeedleGamersCount(): int
    {
        return $this->parameters['gamersCount'];
    }

    public function checkOnConnect(Connection $connection, array $authData): bool
    {
        if ($this->getUser($connection)) {
            return true;
        }

        if ($this->requirePassword() && !$this->checkPassword($authData['password'] ?? null)) {
            return false;
        }
        
        return $this->users->acceptWaitingUser($connection, $authData['token'] ?? null);
    }

    public function checkOnReconnect(Connection $connection, string $oldConnectionId): bool
    {
        if (!parent::checkOnReconnect($connection, $oldConnectionId)) {
            return false;
        }

        return $this->users->acceptDisconnectedUser($connection, $oldConnectionId);
    }

    public function onConnect(Connection $connection): void
    {
        parent::onConnect($connection);
        $this->timerOff();

        if ($this->users->connectionIsObserver($connection)) {
            $this->onObserverConnect($connection);
            return;
        }

        $game = $this->getGame();
        $this->sendGameReferences($connection);
        $game->promiseGamerForConnection($connection);
        $event = $this->createEvent('new-gamer');
        $game->prepareNewGamerEvent($event);
        $event->send();

        /** @var GamesServer $app */
        $app = lx::$app;
        if ($this->getGamersCount() != $this->getNeedleGamersCount()) {
            $app->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
            return;
        }

        // Game has stuffed
        $this->isStuffed = true;
        $app->getCommonChannel()->trigger('game-stuffed', [
            'channel' => $this->getName(),
        ]);
        $app->getCommonChannel()->stuffPendingGame($this);

        $game->beforeStaffed();
        $event = $this->createEvent('game-stuffed');
        $game->prepareStaffedEvent($event);
        $event->send();
        $game->setPending(false);
        $game->afterStaffed();
    }

    public function triggerGameBegin(): void
    {
        $game = $this->getGame();
        $game->beforeBegin();
        $event = $this->createEvent('game-begin');
        $game->prepareBeginEvent($event);
        $event->send();
        $game->afterBegin();
    }

    public function triggerGameLoaded(): void
    {
        $game = $this->getGame();
        $event = $this->createEvent('game-loaded');
        $game->prepareLoadedEvent($event);
        $event->send();
    }

    public function onReconnect(Connection $connection): void
    {
        parent::onReconnect($connection);
        $this->timerOff();

        if ($this->users->connectionIsObserver($connection)) {
            $this->onObserverConnect($connection);
            return;
        }

        $game = $this->getGame();
        if (!$this->game->actualizeGamerByConnection($connection)) {
            $this->trigger('error', 'Gamer reconnection problem');
            return;
        }

        /** @var GamesServer $app */
        $app = lx::$app;
        if ($game->isPending()) {
            $app->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
        }

        $this->sendGameReferences($connection);
        $event = $this->createEvent('gamer-reconnected');
        $game->prepareGamerReconnectedEvent($event, $connection);
        $event->send();
    }

    public function afterConnect(Connection $connection): void
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        $app->getCommonChannel()->sendAdminEvent('newGameChannelConnection', [
            'gameChannel' => $this,
            'connection' => $connection,
        ]);
    }

    public function onDisconnect(Connection $connection): void
    {
        parent::onDisconnect($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->timerOn();
        }

        $user = $this->getUser($connection);
        if (!$user) {
            return;
        }

        if ($this->game->isPending()) {
            /** @var GamesServer $app */
            $app = lx::$app;
            $app->getCommonChannel()->onUserLeaveGame($this, $user);
        }

        $this->users->disconnectUser($connection);
    }

    public function onLeave(Connection $connection): void
    {
        parent::onLeave($connection);
        
        /** @var GamesServer $app */
        $app = lx::$app;

        if ($this->getConnectionsCount() == 0) {
            $app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $app->getCommonChannel()->closePendingGame($this);
            $this->drop();
            return;
        }
        
        if ($this->users->connectionIsObserver($connection)) {
            $this->users->dropUser($connection);
            return;
        }

        if ($this->game->isPending()) {
            $app->getCommonChannel()->onUserLeaveGame($this, $this->getUser($connection));
        }

        $gamer = $this->game->getGamerByConnection($connection);
        $this->game->dropGamer($gamer);
        $this->trigger('gamer-leave', ['gamer' => $gamer->getId()]);
        $this->users->dropUser($connection);
    }

    public function afterDisconnect(Connection $connection): void
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        $app->getCommonChannel()->sendAdminEvent('dropGameChannelConnection', [
            'gameChannel' => $this,
            'connection' => $connection,
        ]);
    }

    public function userIsDisconnected(ModelInterface $user): bool
    {
        return $this->users->userIsDisconnected($user);
    }
    
    public function beforeClose(): void
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        $app->getCommonChannel()->closeGame($this);
    }

    public function onIteration(): void
    {
        if ($this->getTimer() > $this->reconnectionPeriod) {
            /** @var GamesServer $app */
            $app = lx::$app;
            $app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $app->getCommonChannel()->closePendingGame($this);
            $app->channels->close($this->getName());
        }
    }

    private function onObserverConnect(Connection $connection): void
    {
        $this->sendGameReferences($connection);
        $event = $this->createEvent('observer-joined');
        $this->getGame()->prepareObserverJoinedEvent($event, $connection);
        $event->send();
    }

    private function sendGameReferences($connection): void
    {
        $data = $this->getGameReferences();
        if (empty($data)) {
            return;
        }
        
        $this->createEvent('set-game-references')
            ->setReceiver($connection)
            ->setData($data)
            ->send();
    }
}
