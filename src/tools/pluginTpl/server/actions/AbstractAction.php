<?php

namespace <<namespace>>\actions;

use lexedo\games\actions\ResponseAction;
use <<namespace>>\<<ucslug>>Game;
use <<namespace>>\<<ucslug>>Gamer;

/**
 * @method <<ucslug>>Game getGame()
 * @method <<ucslug>>Gamer getInitiator()
 */
abstract class AbstractAction extends ResponseAction
{
    const PING = 'ActionPing';

    static protected function getActionsMap(): array
    {
        return [
            self::PING => ActionPing::class,
        ];
    }
}
