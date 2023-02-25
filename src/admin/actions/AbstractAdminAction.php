<?php

namespace lexedo\games\admin\actions;

use Exception;
use lexedo\games\admin\Admin;
use lexedo\games\requestHandling\actions\AbstractAction;

abstract class AbstractAdminAction extends AbstractAction
{
    protected function beforeRun(): void
    {
        $connection = $this->request->getInitiator();
        if (!$connection || !$this->channel->hasAdminConnection($connection)) {
            throw new Exception('Authorization failed');
        }
    }

    protected function getAdmin(): ?Admin
    {
        $connection = $this->request->getInitiator();
        if (!$connection) {
            return null;
        }

        $admins = $this->channel->getAdminsList();
        return $admins[$connection->getId()] ?? null;
    }
}
