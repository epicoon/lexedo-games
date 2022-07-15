<?php

namespace lexedo\games\sys\models;

use lx\model\Model;
use lexedo\games\models\GameSave;

/**
 * @property string $userAuthValue
 * @property string $gamerId
 * @property bool $isHolder
 * @property bool $isSubscubed
 * @property GameSave $gameSave
 */
class GamerInGameMediator extends Model
{
    public static function getServiceName(): string
    {
        return 'lexedo/games';
    }

    public static function getSchemaArray(): array
    {
        return [
            'name' => 'GamerInGame',
            'fields' => [
                'userAuthValue' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'gamerId' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'isHolder' => [
                    'type' => 'bool',
                    'required' => false,
                    'default' => false,
                ],
                'isSubscubed' => [
                    'type' => 'bool',
                    'required' => false,
                    'default' => true,
                ],
            ],
            'relations' => [
                'gameSave' => [
                    'type' => 'manyToOne',
                    'relatedEntityName' => 'GameSave',
                    'relatedAttributeName' => 'gamers',
                ],
            ],
        ];
    }
}
