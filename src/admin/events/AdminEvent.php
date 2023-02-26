<?php

namespace lexedo\games\admin\events;

use lexedo\games\CommonChannel;
use lx\socket\channel\ChannelEvent;
use lx\socket\Connection;

/**
 * @method CommonChannel getChannel()
 */
class AdminEvent extends ChannelEvent
{
    public function __construct(string $name, array $data, CommonChannel $channel, ?Connection $initiator = null)
    {
        parent::__construct($name, $data, $channel, $initiator);
        $reseivers = $this->defineReceivers();
        if (empty($reseivers)) {
            $this->stop();
        } else {
            $this->setReceivers($reseivers);
        }
    }

    public function preprocess(): bool
    {
        return $this->preprocessName() && $this->preprocessData();
    }

    protected function preprocessName(): bool
    {
        return true;
    }

    protected function preprocessData(): bool
    {
        return true;
    }

    /**
     * @return Connection[]
     */
    protected function defineReceivers(): array
    {
        return $this->channel->getAdminConnections();
    }
}
