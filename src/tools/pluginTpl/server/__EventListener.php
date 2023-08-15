<?php

namespace <<namespace>>;

use lexedo\games\GameEventListener;
use lx\socket\channel\ChannelEvent;

/**
 * @method <<ucslug>>Channel getChannel()
 * @method <<ucslug>>Game getGame()
 */
class <<ucslug>>EventListener extends GameEventListener
{
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * EVENT HANDLERS
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public function onTest(ChannelEvent $event): void
    {
        $event->addData(['server_test' => 'ok']);
    }
}
