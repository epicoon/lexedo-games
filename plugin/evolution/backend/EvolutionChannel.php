<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\evolution\backend\game\Cart;
use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\PropertyBank;
use lexedo\games\GameChannel;
use lx\socket\Connection;

/**
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

    public function getGameReferences(): array
    {
        return [
            'properties' => PropertyBank::$data,
        ];
    }
}
