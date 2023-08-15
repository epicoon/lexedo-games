<?php

namespace <<namespace>>;

use lexedo\games\GameChannel;

/**
 * @method <<ucslug>>Game getGame()
 */
class <<ucslug>>Channel extends GameChannel
{
    public static function getDependenciesConfig(): array
    {
        return array_merge(parent::getDependenciesConfig(), [
            'eventListener' => <<ucslug>>EventListener::class,
            'game' => <<ucslug>>Game::class,
        ]);
    }
}
