<?php

namespace lexedo\games\actions;

use lexedo\games\GameEventListener;
use lx\socket\channel\ChannelEvent;

abstract class ActionsEventListener extends GameEventListener
{
    /**
     * @abstract
     */
    protected static function getActionClass(): string
    {
        return ResponseAction::class;
    }

    public function onAction(ChannelEvent $event): void
    {
        $data = $event->getData();
        $actionName = $data['action'];

        $actionClass = static::getActionClass();
        $action = $actionClass::create($this->getGame(), $actionName);
        $action->setInitiator($this->getGame()->getGamerByConnection($event->getInitiator()));
        $action->setRequestData($data['data']);
        $response = $action->run();
        if (!$action->isSuccessful()) {
            $event->setReceiver($event->getInitiator());
        }
        $event->setData($response);
    }
}
