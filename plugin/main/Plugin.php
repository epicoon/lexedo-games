<?php

namespace lexedo\games\main;

class Plugin extends \lx\Plugin {
    public function getPermissions()
    {
        return [
            \lx\Plugin::DEFAULT_SOURCE_METHOD => ['client_w', 'client_r'],
        ];
    }
}
