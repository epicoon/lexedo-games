<?php

namespace lexedo\games\cofb\backend;

use lexedo\games\GameChannel;

/**
 * @method CofbGame getGame()
 */
class CofbChannel extends GameChannel
{
    public static function getConfigProtocol(): array
    {
        return array_merge(parent::getConfigProtocol(), [
            'eventListener' => CofbEventListener::class,
            'game' => CofbGame::class,
        ]);
    }

    public function getGameReferences(): array
    {
        return [
            //TODO
        ];
    }
}
