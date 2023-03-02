<?php

namespace lexedo\games;

use lexedo\games\models\AvailableGamePlugin;
use lx\FusionComponentInterface;
use lx\FusionComponentTrait;
use lx\Plugin;

class GamesProvider implements FusionComponentInterface
{
    use FusionComponentTrait;
    
    private ?array $gamesData = null;

    protected function getGames(): array
    {
        if ($this->gamesData === null) {
            $this->loadGamesData();
        }
        
        return $this->gamesData;
    }

    public function getFullData(): array
    {
        $result = [];
        foreach ($this->getGames() as $type => $game) {
            $result[] = [
                'type' => $type,
                'connectionType' => $game['connectionType'],
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

    private function loadGamesData(): void
    {
        $games = AvailableGamePlugin::find([
            'ORDER BY' => 'sorting ASC'
        ]);
        
        $data = [];
        /** @var AvailableGamePlugin $gamePluginData */
        foreach ($games as $gamePluginData) {
            if (!$gamePluginData->isActive) {
                continue;
            }

            $gamePluginName = $gamePluginData->name;
            $gamePlugin = \lx::$app->getPlugin($gamePluginName);
            if (!$gamePlugin || !($gamePlugin instanceof GamePlugin)) {
                continue;
            }

            $data[$gamePlugin->getGameSlug()] = [
                'channel' => $gamePlugin->getGameChannelClass(),
                'connectionType' => $gamePlugin->getGameConnectionType(),
                'plugin' => $gamePluginName,
                'image' => $gamePlugin->getTitleImage(),
                'minGamers' => $gamePlugin->getMinGamers(),
                'maxGamers' => $gamePlugin->getMaxGamers(),
            ];
        }
        $this->gamesData = $data;
    }
}
