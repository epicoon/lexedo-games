<?php

namespace lexedo\games\sys\models;

use lx\model\Model;

/**
 * Class AvailableGamePluginMediator
 * @package lexedo\games\sys\models
 *
 * @property string $name
 * @property bool $isActive
 * @property int $sorting
 */
class AvailableGamePluginMediator extends Model
{
    public static function getServiceName(): string
    {
        return 'lexedo/games';
    }

    public static function getSchemaArray(): array
    {
        return [
            'name' => 'AvailableGamePlugin',
            'fields' => [
                'name' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'isActive' => [
                    'type' => 'bool',
                    'required' => false,
                    'default' => false,
                ],
                'sorting' => [
                    'type' => 'int',
                    'required' => false,
                ],
            ],
            'relations' => [],
        ];
    }
}
