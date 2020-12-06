<?php

namespace lexedo\games;

use lexedo\games\chesslike\backend\ChessChannel;
use lexedo\games\evolution\backend\EvolutionChannel;
use lx\FusionComponentInterface;
use lx\FusionComponentTrait;
use lx\ObjectTrait;
use lx\Plugin;

/**
 * Class GamesProvider
 * @package lexedo\games
 */
class GamesProvider implements FusionComponentInterface
{
    use ObjectTrait;
    use FusionComponentTrait;

    /**
     * @return array
     */
    protected function getGames()
    {
        return [
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
    }

    /**
     * @return array
     */
    public function getFullData()
    {
        $result = [];
        foreach ($this->getGames() as $name => $game) {
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
    public function getGameData($name)
    {
        if (!array_key_exists($name, $this->getGames())) {
            return null;
        }

        $data = $this->getGames()[$name];
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
    public function getGameChannelClass($name)
    {
        if (!array_key_exists($name, $this->getGames())) {
            return null;
        }

        return $this->getGames()[$name]['channel'] ?? null;
    }

    /**
     * @param string $name
     * @return Plugin|null
     */
    public function getGamePlugin($name)
    {
        if (!array_key_exists($name, $this->getGames())) {
            return null;
        }

        $pluginName = $this->getGames()[$name]['plugin'] ?? null;
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
