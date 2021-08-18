<?php

namespace lexedo\games;

use lexedo\games\chesslike\backend\ChessChannel;
use lexedo\games\evolution\backend\EvolutionChannel;
use lx\FusionComponentInterface;
use lx\FusionComponentTrait;
use lx\ObjectTrait;
use lx\Plugin;

class GamesProvider implements FusionComponentInterface
{
    use FusionComponentTrait;

    protected function getGames(): array
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

    public function getFullData(): array
    {
        $result = [];
        foreach ($this->getGames() as $type => $game) {
            $result[] = [
                'type' => $type,
                'image' => $game['image'],
                'minGamers' => $game['minGamers'],
                'maxGamers' => $game['maxGamers'],
            ];
        }
        return $result;
    }

    public function getGameData(string $name): ?array
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

    public function getGameChannelClass(string $name): ?string
    {
        if (!array_key_exists($name, $this->getGames())) {
            return null;
        }

        return $this->getGames()[$name]['channel'] ?? null;
    }

    public function getGamePlugin(string $name): ?Plugin
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
