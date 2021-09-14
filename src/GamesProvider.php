<?php

namespace lexedo\games;

use lexedo\games\chesslike\backend\ChessChannel;
use lexedo\games\evolution\backend\EvolutionChannel;
use lexedo\games\cofb\backend\CofbChannel;
use lx\FusionComponentInterface;
use lx\FusionComponentTrait;
use lx\ObjectTrait;
use lx\Plugin;

class GamesProvider implements FusionComponentInterface
{
    use FusionComponentTrait;
    
    protected array $games = [];
    private ?array $gamesData = null;

    protected function getGames(): array
    {
        if ($this->gamesData === null) {
            $this->loadGamesData();
        }
        
        return $this->gamesData;
    }
    
    private function loadGamesData(): void
    {
        $data = [];
        foreach ($this->games as $gamePluginName) {
            $gamePlugin = \lx::$app->getPlugin($gamePluginName);
            if (!$gamePlugin || !($gamePlugin instanceof GamePlugin)) {
                continue;
            }
            
            $data[$gamePlugin->getGameSlug()] = [
                'channel' => $gamePlugin->getGameChannelClass(),
                'plugin' => $gamePluginName,
                'image' => $gamePlugin->getTitleImage(),
                'minGamers' => $gamePlugin->getMinGamers(),
                'maxGamers' => $gamePlugin->getMaxGamers(),
            ];
        }
        $this->gamesData = $data;
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

    public function getGameData(string $type): ?array
    {
        if (!array_key_exists($type, $this->getGames())) {
            return null;
        }

        $data = $this->getGames()[$type];
        return [
            'type' => $type,
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
