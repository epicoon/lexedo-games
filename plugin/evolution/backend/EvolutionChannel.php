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

    public function init(): void
    {
        $this->game = new Game($this);
    }

    public function getData(): array
    {
        return [
            'properties' => PropertyBank::$data,
        ];
    }

    protected function onGamerDisconnected(string $gamerId)
    {
        $this->game->onGamerLeave($gamerId);
    }
}
