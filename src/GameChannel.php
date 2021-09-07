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
    protected GamesServer $app;
    /** @var array<ModelInterface> */
    protected $usersWaitingList = [];
    /** @var array<ModelInterface> */
    protected array $userList = [];
    protected bool $isStuffed = false;
    protected ?AbstractGame $game = null;

    /** @var array<ModelInterface> */
    private array $disconnectedUsers = [];

    abstract protected function createGame(): AbstractGame;
    
    public function init(): void
    {
        $this->app = lx::$app;
        $this->game = $this->createGame();

        if ($this->getParameter('loading')) {
            $conditionClass = $this->game->getConditionClass();
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

    public function addUserWaiting(string $token, ModelInterface $user): void
    {
        $this->usersWaitingList[$token] = $user;
    }

    public function getUser(Connection $connection): ?ModelInterface
    {
        return $this->userList[$connection->getId()] ?? null;
    }

    public function getNeedleGamersCount(): int
    {
        return $this->parameters['gamersCount'];
    }

    public function checkOnConnect(Connection $connection, array $authData): bool
    {
        if ($this->requirePassword() && !$this->checkPassword($authData['password'] ?? null)) {
            return false;
        }

        $token = $authData['token'] ?? null;
        if (!$token || !array_key_exists($token, $this->usersWaitingList)) {
            return false;
        }

        $this->userList[$connection->getId()] = $this->usersWaitingList[$token];
        unset($this->usersWaitingList[$token]);
        return true;
    }

    public function checkOnReconnect(Connection $connection, string $oldConnectionId, array $authData): bool
    {
        parent::checkOnReconnect($connection, $oldConnectionId, $authData);

        if (!array_key_exists($oldConnectionId, $this->disconnectedUsers)) {
            return false;
        }

        $this->userList[$connection->getId()] = $this->disconnectedUsers[$oldConnectionId];
        unset($this->disconnectedUsers[$oldConnectionId]);
        return true;
    }

    public function onConnect(Connection $connection): void
    {
        parent::onConnect($connection);

        $this->timerOff();

        $this->sendGameData($connection);

        if ($this->game->isActive()) {
            $this->game->actualizeGamerConnection($connection);
            $gamer = $this->game->getGamerByConnection($connection);
        } else {
            $gamer = $this->game->createGamerByConnection($connection);
        }
        $this->trigger('new-gamer', $this->getGamersData());

        if ($this->getConnectionsCount() == $this->getNeedleGamersCount()) {
            $this->app->getCommonChannel()->trigger('game-stuffed', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->stuffPendingGame($this);
            $this->isStuffed = true;
            $this->trigger('game-stuffed');
            $this->getGame()->setPending(false);

            if ($this->game->isActive()) {
                $event = $this->createEvent('game-loaded');
                foreach ($this->getGame()->getGamers() as $gamer) {
                    $this->getGame()->fillEventGameDataForGamer($event, $gamer);
                }
            } else {
                $event = $this->createEvent('game-begin');
                $this->getGame()->fillEventBeginGame($event);
            }

            $event->send();
        } else {
            $this->app->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
        }
    }

    public function onReconnect(Connection $connection): void
    {
        parent::onReconnect($connection);

        $this->timerOff();

        if ($this->getGame()->isPending()) {
            $this->app->getCommonChannel()->onUserJoinGame($this, $this->getUser($connection));
        }

        if (!$this->game->actualizeGamerConnection($connection)) {
            $this->trigger('error', 'Gamer reconnection problem');
            return;
        }

        $this->sendGameData($connection);
        $gamer = $this->game->getGamerByConnection($connection);

        $event = $this->createEvent('gamer-reconnected');
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
        $this->getGame()->fillEventGameDataForGamer($event, $gamer);
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
            $this->app->getCommonChannel()->onUserLeaveGame($this, $user);
        }

        $this->disconnectedUsers[$connection->getId()] = $this->userList[$connection->getId()];
        unset($this->userList[$connection->getId()]);
    }

    public function onLeave(Connection $connection): void
    {
        parent::onLeave($connection);

        if ($this->getConnectionsCount() == 0) {
            $this->app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closePendingGame($this);
            $this->drop();
        } else {
            if ($this->game->isPending()) {
                $this->app->getCommonChannel()->onUserLeaveGame($this, $this->getUser($connection));
            }

            $gamer = $this->game->getGamerByConnection($connection);
            $this->game->dropGamer($gamer);
            $this->trigger('gamer-leave', ['gamer' => $gamer->getId()]);
            unset($this->userList[$connection->getId()]);
        }
    }
    
    public function hasDisconnectedUser(ModelInterface $user): bool
    {
        return in_array($user, $this->disconnectedUsers);
    }
    
    public function beforeClose(): void
    {
        $this->app->getCommonChannel()->closeGame($this);
    }

    public function onIteration(): void
    {
        if ($this->getTimer() > $this->reconnectionPeriod) {
            $this->app->getCommonChannel()->trigger('game-close', [
                'channel' => $this->getName(),
            ]);
            $this->app->getCommonChannel()->closePendingGame($this);
            $this->app->channels->close($this->getName());
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
