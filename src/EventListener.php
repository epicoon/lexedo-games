<?php

namespace lexedo\games;

use lx;
use lx\Math;
use lx\socket\Channel\ChannelEvent;
use lx\socket\Channel\ChannelEventListener;

/**
 * Class EventListener
 * @package lexedo\games
 */
class EventListener extends ChannelEventListener
{
    /**
     * @param ChannelEvent $event
     */
    public function onNewGame($event)
    {
        $eventData = $event->getData();
        $gameData = GamesProvider::getGameData($eventData['type']);
        if (!$gameData) {
            $event->replaceEvent('error', [
                'message' => 'Wrong game type'
            ]);
            $event->setReceivers($event->getInitiator());
            return;
        }

        if ($eventData['gamers'] < $gameData['minGamers'] || $eventData['gamers'] > $gameData['maxGamers']) {
            $event->replaceEvent('error', [
                'message' => 'Wrong gamers count'
            ]);
            $event->setReceivers($event->getInitiator());
            return;
        }

        $channelKey = Math::randHash();
        $channelClass = GamesProvider::getGameChannelClass($eventData['type']);

        /** @var GamesServer $app */
        $app = lx::$app;
        /** @var GameChannel $channel */
        $channel = $app->channels->create($channelKey, $channelClass, [
            'metaData' => [
                'type' => $eventData['type'],
                'name' => $eventData['name'],
                'gamersCount' => $eventData['gamers'],
            ],
        ]);

        if (isset($eventData['password']) && $eventData['password'] != '') {
            $channel->setPassword($eventData['password']);
        }

        $token = Math::randHash();
        $channel->addUserWaiting(
            $token,
            $app->getCommonChannel()->getUser($event->getInitiator())
        );

        $app->getCommonChannel()->openWaitedGame($channel);

        $subEvent = $event->replaceEvent('gameCreated', [
            'channelKey' => $channelKey,
            'gameData' =>  $gameData,
            'gameName' => $eventData['name'],
            'gamersRequired' => $eventData['gamers'],
        ]);
        $subEvent->setDataForConnection($event->getInitiator(), ['token' => $token]);
    }

    /**
     * @param ChannelEvent $event
     */
    public function onAskForJoin($event)
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
            $event->setReceivers($event->getInitiator());
            return;
        }

        if ($channel->isStuffed()) {
            $event->replaceEvent('error', [
                'message' => 'Game is stuffed'
            ]);
            $event->setReceivers($event->getInitiator());
            return;
        }

        $token = Math::randHash();
        $channel->addUserWaiting(
            $token,
            $app->getCommonChannel()->getUser($event->getInitiator())
        );

        $subEvent = $event->replaceEvent('gameJoining', [
            'channelKey' => $eventData['key'],
            'token' => $token,
        ]);
        $subEvent->setReceivers($event->getInitiator());
    }
}
