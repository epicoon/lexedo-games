<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\evolution\backend\game\Cart;
use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\PropertyBank;
use lexedo\games\GameChannel;

/**
 * Class EvolutionChannel
 * @package lexedo\games\evolution\backend
 *
 * @method Game getGame()
 */
class EvolutionChannel extends GameChannel
{
    public static function getConfigProtocol(): array
    {
        return array_merge(parent::getConfigProtocol(), [
            'eventListener' => ChannelEventListener::class,
        ]);
    }

    public function init()
    {
        $this->game = new Game($this);
    }

    /**
     * @return array
     */
    public function getData()
    {
        return [
            'properties' => PropertyBank::$data,
        ];
    }

    /**
     * @param string $gamerId
     */
    protected function onGamerDisconnected($gamerId)
    {
        $this->game->onGamerLeave($gamerId);
    }
}
