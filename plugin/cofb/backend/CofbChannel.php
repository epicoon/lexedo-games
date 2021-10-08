<?php

namespace lexedo\games\cofb\backend;

use lexedo\games\GameChannel;

/**
 * @method CofbGame getGame()
 */
class CofbChannel extends GameChannel
{
    public static function getDependenciesConfig(): array
    {
        return array_merge(parent::getDependenciesConfig(), [
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
