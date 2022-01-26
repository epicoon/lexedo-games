<?php

namespace lexedo\games\plugin\manage\server;

use lx\auth\RbacResourceInterface;
use lx\Plugin as lxPlugin;

class Plugin extends lxPlugin implements RbacResourceInterface
{
    public function getPermissions(): array
    {
        return [
            lxPlugin::DEFAULT_RESOURCE_METHOD => ['admin_w', 'admin_r'],
        ];
    }
}
