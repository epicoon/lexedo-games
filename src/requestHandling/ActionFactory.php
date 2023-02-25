<?php

namespace lexedo\games\requestHandling;

use lexedo\games\CommonChannel;
use lx\socket\Channel\ChannelRequest;
use lexedo\games\requestHandling\actions\AbstractAction;
use lx\StringHelper;

class ActionFactory
{
    public static function getAction(CommonChannel $channel, ChannelRequest $request): ?AbstractAction
    {
        $route = $request->getRoute();
        $routeArr = explode('/', $route);
        $class = '';
        if (count($routeArr) == 1) {
            $prefix = 'lexedo\games\requestHandling\actions\\';
            $class = $prefix . 'Action' . ucfirst(StringHelper::snakeToCamel($routeArr[0], ['-', '_']));
        } elseif (count($routeArr == 2)) {
            if ($routeArr[0] == 'admin') {
                $prefix = 'lexedo\games\admin\actions\\';
                $class = $prefix . 'Action' . ucfirst(StringHelper::snakeToCamel($routeArr[1], ['-', '_']));
            }
        }

        if (!class_exists($class) || !is_subclass_of($class, AbstractAction::class)) {
            return null;
        }

        return new $class($channel, $request);
    }
}
