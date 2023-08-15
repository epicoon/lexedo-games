<?php

namespace <<namespace>>;

use lexedo\games\actions\ActionsEventListener;
use <<namespace>>\actions\AbstractAction;
use lx\socket\channel\ChannelEvent;

/**
 * @method <<ucslug>>Channel getChannel()
 * @method <<ucslug>>Game getGame()
 */
class <<ucslug>>EventListener extends ActionsEventListener
{
    protected function getActionClass(): string
    {
        return AbstractAction::class;
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * EVENT HANDLERS
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public function onTest(ChannelEvent $event): void
    {
        $event->addData(['server_test' => 'ok']);
    }
}
