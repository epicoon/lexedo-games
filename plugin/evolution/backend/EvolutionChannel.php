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
    public static function getDependenciesConfig(): array
    {
        return array_merge(parent::getDependenciesConfig(), [
            'eventListener' => ChannelEventListener::class,
            'game' => Game::class,
        ]);
    }

    public function getGameReferences(): array
    {
        return [
            'properties' => PropertyBank::$data,
        ];
    }
}
