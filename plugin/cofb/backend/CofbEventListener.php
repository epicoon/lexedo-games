<?php

namespace lexedo\games\cofb\backend;

use lexedo\games\GameEventListener;
use lx\socket\Channel\ChannelEvent;

/**
 * @method CofbChannel getChannel()
 * @method CofbGame getGame()
 */
class CofbEventListener extends GameEventListener
{
    public function getAvailableEventNames(): array
    {
        return ['chat-message'];
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * EVENT HANDLERS
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public function onTest(ChannelEvent $event): void
    {
        $event->addData(['server_test' => 'ok']);
    }
}
