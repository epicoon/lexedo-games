<?php

namespace lexedo\games\main;

use lx\auth\RbacResourceInterface;

class Plugin extends \lx\Plugin implements RbacResourceInterface
{
    public function getPermissions()
    {
        return [
            \lx\Plugin::DEFAULT_RESOURCE_METHOD => ['client_w', 'client_r'],
        ];
    }
}
