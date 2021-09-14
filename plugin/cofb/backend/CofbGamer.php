<?php

namespace lexedo\games\cofb\backend;

use lexedo\games\AbstractGamer;

/**
 * @property CofbGame $game
 * @method CofbGame getGame()
 */
class CofbGamer extends AbstractGamer
{
    protected function init(): void
    {
        // pass
    }

    function restore(array $config): void
    {
        //TODO
    }
}
