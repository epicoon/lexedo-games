<?php

namespace <<namespace>>;

use lexedo\games\AbstractGamer;

/**
 * @property-read <<ucslug>>Game $game
 * @method <<ucslug>>Game getGame()
 */
class <<ucslug>>Gamer extends AbstractGamer
{
    protected function init(): void
    {
        //TODO
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            //TODO
        ]);
    }

    public function restore(array $config): void
    {
        //TODO
    }
}
