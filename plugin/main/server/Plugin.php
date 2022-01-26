<?php

namespace lexedo\games\plugin\main\server;

use lx\Plugin as lxPlugin;
use lx\auth\RbacResourceInterface;

class Plugin extends lxPlugin implements RbacResourceInterface
{
    public function getPermissions(): array
    {
        return [
            lxPlugin::DEFAULT_RESOURCE_METHOD => ['client_w', 'client_r'],
        ];
    }
}
