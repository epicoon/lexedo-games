<?php

namespace lexedo\games\actions;

use lexedo\games\CommonChannel;
use lx\socket\Channel\ChannelRequest;

class ActionFactory
{
    public static function getAction(CommonChannel $channel, ChannelRequest $request): ?AbstractAction
    {
        $prefix = 'lexedo\games\actions\Action';
        $route = $request->getRoute();
        $class = $prefix . ucfirst($route);
        if (!class_exists($class)) {
            return null;
        }

        return new $class($channel, $request);
    }
}
