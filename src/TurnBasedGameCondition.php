<?php

namespace lexedo\games;

/**
 * @method array getTurnSequence()
 * @method string getActiveGamer()
 *
 * @method $this setTurnSequence(array $sequence)
 * @method $this setActiveGamer(string $gamerId)
 */
class TurnBasedGameCondition extends AbstractGameCondition
{
    protected array $turnSequence;
    protected string $activeGamer;

    protected function getFields(): array
    {
        return array_merge(parent::getFields(), [
            'turnSequence',
            'activeGamer',
        ]);
    }
}
