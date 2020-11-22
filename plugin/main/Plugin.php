<?php

namespace lexedo\games\main;

use lx\Plugin as lxPlugin;
use lx\auth\RbacResourceInterface;

class Plugin extends lxPlugin implements RbacResourceInterface
{
    public function getPermissions()
    {
        return [
            lxPlugin::DEFAULT_RESOURCE_METHOD => ['client_w', 'client_r'],
        ];
    }
}
