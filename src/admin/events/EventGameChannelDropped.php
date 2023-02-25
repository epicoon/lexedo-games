<?php

namespace lexedo\games\admin\events;

use lexedo\games\GameChannel;

class EventGameChannelDropped extends AdminEvent
{
    protected function preprocessData(): bool
    {
        /** @var GameChannel $channel */
        $channel = $this->data['gameChannel'] ?? null;
        if (!$channel) {
            return false;
        }

        $this->data = [
            'channelName' => $channel->getName(),
        ];

        return true;
    }
}
