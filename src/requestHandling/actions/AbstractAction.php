<?php

namespace lexedo\games\requestHandling\actions;

use lexedo\games\CommonChannel;
use lx\socket\channel\request\ChannelRequest;

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
     * @return mixed|null
     */
    public function run()
    {
        $this->beforeRun();
        return $this->process();
    }

    protected function beforeRun(): void
    {
        // pass
    }

    /**
     * @return mixed|null
     */
    abstract protected function process();
}
