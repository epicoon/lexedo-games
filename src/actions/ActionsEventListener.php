<?php

namespace lexedo\games\actions;

use lexedo\games\GameEventListener;
use lx\socket\channel\ChannelEvent;

abstract class ActionsEventListener extends GameEventListener
{
    abstract protected function getActionClass(): string;

    public function onAction(ChannelEvent $event): void
    {
        $data = $event->getData();
        $actionName = $data['action'];

        $actionClass = $this->getActionClass();
        /** @var ResponseAction $action */
        $action = $actionClass::create($this->getGame(), $actionName);
        $action->setInitiator($this->getGame()->getGamerByConnection($event->getInitiator()));
        $action->setRequestData($data['data']);
        $response = $action->run();

        if ($action instanceof ServerOnlyInterface) {
            $event->stop();
            return;
        }

        if (!$action->isSuccessful()) {
            $event->setReceiver($event->getInitiator());
        }

        if ($action instanceof ConnectionDependentInterface) {
            $connections = $event->getReceivers();
            foreach ($connections as $connection) {
                $event->setDataForConnection(
                    $connection,
                    $action->processForConnection($connection, $response)
                );
            }
        } else {
            $event->setData($response);
        }
    }
}
