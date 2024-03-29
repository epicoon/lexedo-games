<?php

namespace lexedo\games;

use lexedo\games\models\GamerInGame;
use lexedo\games\models\GameSave;
use lx;
use lx\Directory;
use lx\File;
use lx\Math;
use lx\ModelInterface;
use lx\socket\channel\Channel;
use lx\socket\channel\ChannelInterface;
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
            $this->game->init();
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

    public function getCommonChannel(): ChannelInterface
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        return $app->getCommonChannel();
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
            $conditionString = $game->getCondition()->toString();
            $conditionToken = null;
            if (mb_strlen($conditionString) > 3990) {
                $plugin = $this->getGamePlugin();
                $cobfDir = new Directory($plugin->conductor->getLocalSystemPath());
                $savesDir = $cobfDir->getOrMakeDirectory('saves');
                $saveFileName = $gameSave->date->format('Y_m_d_h_i_s')
                    . '_' . $gameName . '_' . lx\Math::rand(1000, 9999);
                $saveFile = new File($saveFileName, $savesDir->getPath());
                $saveFile->put($conditionString);
                $conditionToken = '{file:' . $saveFile->getPath() . '}';
            } else {
                $conditionToken = $conditionString;
            }

            $gameSave->data = $conditionToken;

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

        if ($this->requirePassword() && !$this->checkPassword($authData['password'] ?? '')) {
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
        $game->fillNewGamerEvent($event);
        $event->send();

        if ($this->getGamersCount() != $this->getNeedleGamersCount()) {
            $this->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
            return;
        }

        // Game has stuffed
        $this->isStuffed = true;
        $this->getCommonChannel()->stuffPendingGame($this);

        $this->trigger('game-stuffed');
        $game->setStuffed();

        if ($this->isLoaded()) {
            $this->triggerGameLoaded();
        } else {
            $this->triggerGamePrepared();
        }
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
            $this->trigger('error', ['message' => 'Gamer reconnection problem']);
            return;
        }

        if (!$game->isStuffed()) {
            $this->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
        }

        $this->sendGameReferences($connection);
        $event = $this->createEvent('gamer-reconnected');
        $game->fillGamerReconnectedEvent($event, $connection);
        $event->send();
    }

    public function afterConnect(Connection $connection): void
    {
        $this->getCommonChannel()->sendAdminEvent('newGameChannelConnection', [
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

        if (!$this->game->isStuffed()) {
            $this->getCommonChannel()->onUserLeaveGame($this, $user);
        }

        $this->users->disconnectUser($connection);
    }

    public function onLeave(Connection $connection): void
    {
        parent::onLeave($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->getCommonChannel()->closePendingGame($this);
            $this->drop();
            return;
        }
        
        if ($this->users->connectionIsObserver($connection)) {
            $this->users->dropUser($connection);
            return;
        }

        if (!$this->game->isStuffed()) {
            $this->getCommonChannel()->onUserLeaveGame($this, $this->getUser($connection));
        }

        $gamer = $this->game->getGamerByConnection($connection);
        $this->game->dropGamer($gamer);
        $this->trigger('gamer-leave', ['gamer' => $gamer->getId()]);
        $this->users->dropUser($connection);
    }

    public function afterDisconnect(Connection $connection): void
    {
        $this->getCommonChannel()->sendAdminEvent('dropGameChannelConnection', [
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
        $this->getCommonChannel()->closeGame($this);
    }

    public function onIteration(): void
    {
        if ($this->getTimer() > $this->reconnectionPeriod) {
            $this->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->getCommonChannel()->closePendingGame($this);
            /** @var GamesServer $app */
            $app = lx::$app;
            $app->channels->close($this->getName());
        }
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * PRIVATE
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private function onObserverConnect(Connection $connection): void
    {
        $this->sendGameReferences($connection);
        $event = $this->createEvent('observer-connected');
        $this->getGame()->fillObserverConnectedEvent($event, $connection);
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

    private function triggerGamePrepared(): void
    {
        $game = $this->getGame();
        $event = $this->createEvent('game-prepared');
        $game->runPreparing();
        $game->fillPreparedEvent($event);
        $event->send();
    }

    private function triggerGameLoaded(): void
    {
        $game = $this->getGame();
        $event = $this->createEvent('game-loaded');
        $game->fillLoadedEvent($event);
        $event->send();
    }
}
