<?php

namespace lexedo\games\admin;

use lx;
use lexedo\games\admin\events\EventGameChannelCreated;
use lexedo\games\admin\events\EventGameChannelDropped;
use lexedo\games\admin\events\EventNewGameChannelConnection;
use lexedo\games\admin\events\EventDropGameChannelConnection;
use lexedo\games\CommonChannel;
use lexedo\games\admin\events\AdminEvent;

class AdminEventSender
{
    private CommonChannel $channel;

    public function __construct(CommonChannel $channel)
    {
        $this->channel = $channel;
    }

    public function send(string $eventName, array $eventData = []): void
    {
        $eventClass = $this->getEventClass($eventName);
        if (!$eventClass) {
            lx::$app->log("Unknown event $eventName", 'error');
            return;
        }
        if (!is_subclass_of($eventClass, AdminEvent::class)) {
            lx::$app->log("Event class $eventClass must be subclass of the AdminEvent", 'error');
            return;
        }

        /** @var AdminEvent $event */
        $event = new $eventClass($eventName, $eventData, $this->channel);
        if (!$event->preprocess()) {
            lx::$app->log("Event $eventName preprocess problem", 'error');
            return;
        }

        $event->send();
    }

    private function getEventClass(string $eventName): ?string
    {
        switch ($eventName) {
            case 'gameChannelCreated': return EventGameChannelCreated::class;
            case 'gameChannelDropped': return EventGameChannelDropped::class;
            case 'newGameChannelConnection': return EventNewGameChannelConnection::class;
            case 'dropGameChannelConnection': return EventDropGameChannelConnection::class;
        }

        return null;
    }
}
