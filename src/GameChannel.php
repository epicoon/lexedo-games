<?php

namespace lexedo\games;

use lexedo\games\models\GamerInGame;
use lexedo\games\models\GameSave;
use lx;
use lx\ModelInterface;
use lx\socket\Channel\Channel;
use lx\socket\Channel\ChannelRequest;
use lx\socket\Channel\ChannelResponse;
use lx\socket\Connection;

abstract class GameChannel extends Channel
{
    protected bool $isStuffed = false;
    protected ?AbstractGame $game = null;
    private GameChannelUserHolder $users;

    public function init(): void
    {
        $this->users = new GameChannelUserHolder();
        if ($this->game) {
            $this->game->setChannel($this);
        }

        if ($this->getParameter('loading')) {
            $conditionClass = $this->game->getDependedClass(AbstractGame::CONDITION_CLASS);
            /** @var AbstractGameCondition $condition */
            $condition = new $conditionClass();
            $condition->initByString($this->getParameter('condition'));
            $this->game->setCondition($condition);
        }
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

    public function handleRequest(ChannelRequest $request): ChannelResponse
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

    public function addWaitingUser(string $token, ModelInterface $user, bool $isObserver = false): void
    {
        $this->users->addWaitingUser($token, $user, $isObserver);
    }

    public function getUser(Connection $connection): ?ModelInterface
    {
        return $this->users->getUser($connection);
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

        $this->sendGameData($connection);

        if ($this->users->connectionIsObserver($connection)) {
            $event = $this->createEvent('observer-joined');
            $event->setReceiver($connection);
            $gameData = $this->getGame()->getGameDataForGamer();
            $event->addDataForConnection($connection, [
                'gamersData' => $this->getGamersData(),
                'gameData' => $gameData,
                'gameIsPending' => $this->getGame()->isPending(),
            ]);
            $event->send();
            return;
        }

        if ($this->game->isActive()) {
            $this->game->actualizeGamerConnection($connection);
        } else {
            $this->game->createGamerByConnection($connection);
        }
        $this->trigger('new-gamer', $this->getGamersData());

        /** @var GamesServer $app */
        $app = lx::$app;
        if ($this->getGamersCount() == $this->getNeedleGamersCount()) {
            $app->getCommonChannel()->trigger('game-stuffed', [
                'channel' => $this->getName(),
            ]);
            $app->getCommonChannel()->stuffPendingGame($this);
            $this->isStuffed = true;
            $this->trigger('game-stuffed');
            $this->getGame()->setPending(false);

            if ($this->game->isActive()) {
                $event = $this->createEvent('game-loaded');
                foreach ($this->getGame()->getGamers() as $gamer) {
                    $gameData = $this->getGame()->getGameDataForGamer($gamer);
                    $event->addDataForConnection($gamer->getConnection(), ['gameData' => $gameData]);
                }
            } else {
                $event = $this->createEvent('game-begin');
                $this->getGame()->fillEventBeginGame($event);
            }

            $event->send();
        } else {
            $app->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
        }
    }

    public function onReconnect(Connection $connection): void
    {
        parent::onReconnect($connection);

        $this->timerOff();

        if ($this->users->connectionIsObserver($connection)) {
            $this->sendGameData($connection);
            $event = $this->createEvent('observer-joined');
            $event->setReceiver($connection);
            $gameData = $this->getGame()->getGameDataForGamer();
            $event->addDataForConnection($connection, [
                'gamersData' => $this->getGamersData(),
                'gameData' => $gameData,
                'gameIsPending' => $this->getGame()->isPending(),
            ]);
            $event->send();
            return;
        }

        if ($this->getGame()->isPending()) {
            /** @var GamesServer $app */
            $app = lx::$app;
            $app->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
        }

        if (!$this->game->actualizeGamerConnection($connection)) {
            $this->trigger('error', 'Gamer reconnection problem');
            return;
        }

        $this->sendGameData($connection);

        $event = $this->createEvent('gamer-reconnected');
        $gamer = $this->game->getGamerByConnection($connection);
        $event->addData([
            'reconnectionData' => [
                'oldConnectionId' => $connection->getOldId(),
                'newConnectionId' => $connection->getId(),
                'gamerId' => $gamer->getId(),
                'gameIsPending' => $this->getGame()->isPending(),
            ],
        ]);
        $event->setDataForConnection($connection, [
            'gamersData' => $this->getGamersData(),
        ]);
        $gameData = $this->getGame()->getGameDataForGamer($gamer);
        $event->addDataForConnection($gamer->getConnection(), ['gameData' => $gameData]);

        $event->send();
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

    private function sendGameData($connection): void
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

    private function getGamersData(): array
    {
        $gamers = $this->game->getGamers();
        $list = [];
        foreach ($gamers as $gamer) {
            $connectionId = $gamer->getConnectionId();
            if (!$connectionId) {
                continue;
            }

            $list[] = [
                'connectionId' => $connectionId,
                'gamerId' => $gamer->getId(),
            ];
        }
        return $list;
    }
}
