<?php

namespace lexedo\games\actions;

use lexedo\games\CommonChannel;
use lx\socket\Channel\ChannelRequest;

abstract class AbstractAction
{
    protected CommonChannel $channel;
    protected ChannelRequest $request;
    
    public function __construct(CommonChannel $channel, ChannelRequest $request)
    {
        $this->channel = $channel;
        $this->request = $request;
    }

    /**
     * @return mixed
     */
    abstract public function run();
}
