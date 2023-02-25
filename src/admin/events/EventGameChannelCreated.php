<?php

namespace lexedo\games\admin\events;

use lexedo\games\admin\AdminHelper;
use lexedo\games\GameChannel;

class EventGameChannelCreated extends AdminEvent
{
    protected function preprocessData(): bool
    {
        /** @var GameChannel $channel */
        $channel = $this->data['gameChannel'] ?? null;
        if (!$channel) {
            return false;
        }

        $this->data = AdminHelper::getGameChannelData($channel);
        return true;
    }
}
