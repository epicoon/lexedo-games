<?php

namespace lexedo\games\admin\events;

use lexedo\games\admin\AdminHelper;
use lx\socket\Connection;

class EventNewGameChannelConnection extends AdminEvent
{
    /**
     * @return Connection[]
     */
    protected function defineReceivers(): array
    {
        return AdminHelper::getGameChannelWatchers(
            $this->getChannel()->getAdminsList(),
            $this->data['gameChannel']
        );
    }

    protected function preprocessData(): bool
    {
        $this->data = AdminHelper::getGameChannelConnectionData(
            $this->data['gameChannel'],
            $this->data['connection']
        );
        return true;
    }
}
