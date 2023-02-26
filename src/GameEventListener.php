<?php

namespace lexedo\games;

use lx\socket\channel\ChannelEventListener;

class GameEventListener extends ChannelEventListener
{
    /**
     * @return AbstractGame
     */
    public function getGame()
    {
        return $this->getChannel()->getGame();
    }
}
