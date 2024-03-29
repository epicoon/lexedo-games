<?php

namespace lexedo\games;

use lexedo\games\models\GameSave;
use lx;
use lx\File;
use lx\Math;
use lx\socket\channel\ChannelEvent;
use lx\socket\channel\ChannelEventListener;

/**
 * @method CommonChannel getChannel()
 */
class EventListener extends ChannelEventListener
{
    public function onNewGame(ChannelEvent $event): void
    {
        $gamesProvider = $this->getChannel()->getGamesProvider();
        $eventData = $event->getData();

        $gameData = $gamesProvider->getGameData($eventData['type']);
        if (!$gameData) {
            $event->replaceEvent('error', [
                'message' => 'Wrong game type'
            ]);
            $event->setReceiver($event->getInitiator());
            return;
        }

        if ($eventData['gamers'] < $gameData['minGamers'] || $eventData['gamers'] > $gameData['maxGamers']) {
            $event->replaceEvent('error', [
                'message' => 'Wrong gamers count'
            ]);
            $event->setReceiver($event->getInitiator());
            return;
        }

        $channel = $this->createGameChannel([
            'type' => $eventData['type'],
            'name' => $eventData['name'],
            'gamersCount' => $eventData['gamers'],
            'loadingMode' => false,
        ]);
        if (isset($eventData['password']) && $eventData['password'] != '') {
            $channel->setPassword($eventData['password']);
        }

        $this->finalizeNewGameEvent($event, $channel);
    }

    public function onLoadGame(ChannelEvent $event): void
    {
        $eventData = $event->getData();
        $type = $eventData['type'];
        $name = $eventData['name'];
        $gameSave = GameSave::findOne([
           'gameType' => $type,
           'name' => $name
        ]);
        if (!$gameSave) {
            $event->replaceEvent('error', [
                'message' => 'Game not found'
            ]);
            $event->setReceiver($event->getInitiator());
            return;
        }

        $gamersInGame = $gameSave->gamers;
        $gamersCount = $gamersInGame->count();

        $condition = null;
        if (preg_match('/^{file:/', $gameSave->data)) {
            $path = trim($gameSave->data, '{}');
            $path = preg_replace('/^file:/', '', $path);
            $file = new File($path);
            $condition = $file->get();
        } else {
            $condition = $gameSave->data;
        }

        $channel = $this->createGameChannel([
            'type' => $type,
            'name' => $name,
            'gamersCount' => $gamersCount,
            'loadingMode' => true,
            'condition' => $condition,
        ]);
        //TODO password

        $users = [];
        foreach ($gamersInGame as $gamerInGame) {
            $users[] = $gamerInGame->userAuthValue;
        }

        $this->finalizeNewGameEvent($event, $channel, $users);
    }

    public function onAskForJoin(ChannelEvent $event): void
    {
        $eventData = $event->getData();

        /** @var GamesServer $app */
        $app = lx::$app;
        /** @var GameChannel $channel */
        $channel = $app->channels->get($eventData['key']);

        if (!$channel) {
            $event->replaceEvent('error', [
                'message' => 'Game not found'
            ]);
            $event->setReceiver($event->getInitiator());
            return;
        }

        if ($channel->isStuffed()) {
            $event->replaceEvent('error', [
                'message' => 'Game is stuffed'
            ]);
            $event->setReceiver($event->getInitiator());
            return;
        }

        if ($channel->requirePassword() && !$channel->checkPassword($eventData['password'] ?? '')) {
            $event->replaceEvent('error', [
                'message' => 'Wrong password'
            ]);
            $event->setReceiver($event->getInitiator());
            return;
        }

        $token = Math::randHash();
        $isObserver = $eventData['isObserver'] ?? false;
        $channel->addWaitingUser(
            $token,
            $app->getCommonChannel()->getUser($event->getInitiator()),
            $isObserver ? GameChannelUser::TYPE_OBSERVER : GameChannelUser::TYPE_PARTICIPANT
        );

        $subEvent = $event->replaceEvent('gameJoining', [
            'channelKey' => $eventData['key'],
            'token' => $token,
        ]);
        $subEvent->setReceiver($event->getInitiator());
    }

    private function createGameChannel(array $parameters): GameChannel
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        $channelKey = Math::randHash();
        while ($app->channels->has($channelKey)) {
            $channelKey = Math::randHash();
        }

        $gamesProvider = $this->getChannel()->getGamesProvider();
        $channelClass = $gamesProvider->getGameChannelClass($parameters['type']);
        /** @var GameChannel $channel */
        return $app->channels->create($channelKey, $channelClass, [
            'reconnectionPeriod' => $app->getConfig('reconnectionPeriod') ?: 0,
            'parameters' => $parameters,
            'plugin' => $gamesProvider->getGamePlugin($parameters['type']),
        ]);
    }

    private function finalizeNewGameEvent(ChannelEvent $event, GameChannel $channel, array $users = []): void
    {
        $this->getChannel()->openPendingGame($channel, $users);

        $token = Math::randHash();
        $channel->addWaitingUser(
            $token,
            $this->getChannel()->getUser($event->getInitiator()),
            GameChannelUser::TYPE_AUTHOR
        );

        $gamesProvider = $this->getChannel()->getGamesProvider();
        $gameData = $gamesProvider->getGameData($channel->getParameter('type'));
        $eventData = [
            'channelKey' => $channel->getName(),
            'gameData' =>  $gameData,
            'gameName' => $channel->getParameter('name'),
            'gamersRequired' => $channel->getNeedleGamersCount(),
            'requirePassword' => $channel->requirePassword(),
        ];

        $subEvent = $event->replaceEvent('gameCreated', $eventData);
        if (!empty($users)) {
            /** @var GamesServer $app */
            $app = lx::$app;
            $receivers = [];
            foreach ($app->connections as $connection) {
                $authField = $this->getChannel()->getUserAuthFieldByConnection($connection);
                $index = array_search($authField, $users, true);
                if ($index !== false) {
                    $receivers[] = $connection;
                    unset($users[$index]);
                }
                if (empty($users)) {
                    break;
                }
            }
            $subEvent->setReceivers($receivers);
        }

        $subEvent->setDataForConnection($event->getInitiator(), ['token' => $token]);

        $this->getChannel()->sendAdminEvent('gameChannelCreated', [
            'gameChannel' => $channel,
        ]);;
    }
}
