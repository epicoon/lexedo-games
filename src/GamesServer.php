<?php

namespace lexedo\games;

use lx\socket\SocketServer;

/**
 * Class GamesServer
 * @package lexedo\games
 */
class GamesServer extends SocketServer
{
    /**
     * @return CommonChannel
     */
    public function getCommonChannel()
    {
        /** @var CommonChannel $result */
        $result = $this->channels->get('common');
        return $result;
    }

    protected function beforeProcess()
    {
        $this->channels->create('common', CommonChannel::class);
    }
}
