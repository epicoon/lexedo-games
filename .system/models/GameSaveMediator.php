<?php

namespace lexedo\games\sys\models;

use lx\model\Model;
use lx\model\schema\field\value\DateTimeValue;
use lx\model\modelTools\RelatedModelsCollection;
use lexedo\games\models\GamerInGame;

/**
 * Class GameSaveMediator
 * @package lexedo\games\sys\models
 *
 * @property string $gameType
 * @property string $name
 * @property DateTimeValue $date
 * @property string $data
 * @property RelatedModelsCollection&GamerInGame[] $gamers
 */
class GameSaveMediator extends Model
{
    public static function getServiceName(): string
    {
        return 'lexedo/games';
    }

    public static function getSchemaArray(): array
    {
        return [
            'name' => 'GameSave',
            'fields' => [
                'gameType' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'name' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'date' => [
                    'type' => 'datetime',
                    'required' => true,
                ],
                'data' => [
                    'type' => 'string',
                    'size' => 4000,
                    'required' => true,
                ],
            ],
            'relations' => [
                'gamers' => [
                    'type' => 'oneToMany',
                    'relatedEntityName' => 'GamerInGame',
                    'relatedAttributeName' => 'gameSave',
                ],
            ],
        ];
    }
}
