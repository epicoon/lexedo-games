<?php

namespace lexedo\games;

use lexedo\games\chesslike\backend\ChessChannel;
use lexedo\games\evolution\backend\EvolutionChannel;
use lx\Plugin;

/**
 * Class GamesProvider
 * @package lexedo\games
 */
class GamesProvider
{
    private static $games = [
        'chess' => [
            'channel' => ChessChannel::class,
            'plugin' => 'lexedo/games:chesslike',
            'image' => 'chess.png',
            'minGamers' => 2,
            'maxGamers' => 2,
        ],
        'evolution' => [
            'channel' => EvolutionChannel::class,
            'plugin' => 'lexedo/games:evolution',
            'image' => 'evolution.png',
            'minGamers' => 2,
            'maxGamers' => 2,
        ],
    ];

    /**
     * @return array
     */
    public static function getFullData()
    {
        $result = [];
        foreach (self::$games as $name => $game) {
            $result[] = [
                'name' => $name,
                'image' => $game['image'],
                'minGamers' => $game['minGamers'],
                'maxGamers' => $game['maxGamers'],
            ];
        }
        return $result;
    }

    /**
     * @param $name
     * @return array|null
     */
    public static function getGameData($name)
    {
        if (!array_key_exists($name, self::$games)) {
            return null;
        }

        $data = self::$games[$name];
        return [
            'name' => $name,
            'image' => $data['image'],
            'minGamers' => $data['minGamers'],
            'maxGamers' => $data['maxGamers'],
        ];
    }

    /**
     * @param string $name
     * @return string|null
     */
    public static function getGameChannelClass($name)
    {
        if (!array_key_exists($name, self::$games)) {
            return null;
        }

        return self::$games[$name]['channel'] ?? null;
    }

    /**
     * @param string $name
     * @return Plugin|null
     */
    public static function getGamePlugin($name)
    {
        if (!array_key_exists($name, self::$games)) {
            return null;
        }

        $pluginName = self::$games[$name]['plugin'] ?? null;
        if (!$pluginName) {
            return null;
        }

        $plugin = \lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return null;
        }

        return $plugin;
    }
}
