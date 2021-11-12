<?php

namespace lexedo\games\sys\models\tetris;

use lx\model\Model;

/**
 * Class LeaderMediator
 * @package lexedo\games\sys\models\tetris
 *
 * @property string $name
 * @property int $place
 * @property int $score
 * @property int $level
 */
class LeaderMediator extends Model
{
    public static function getServiceName(): string
    {
        return 'lexedo/games';
    }

    public static function getSchemaArray(): array
    {
        return [
            'name' => 'tetris\\Leader',
            'fields' => [
                'name' => [
                    'type' => 'string',
                    'required' => false,
                ],
                'place' => [
                    'type' => 'int',
                    'required' => false,
                ],
                'score' => [
                    'type' => 'int',
                    'required' => false,
                ],
                'level' => [
                    'type' => 'int',
                    'required' => false,
                ],
            ],
            'relations' => [],
        ];
    }
}
