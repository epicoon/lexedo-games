<?php

namespace lexedo\games\plugin\main\server;

use lx;
use lexedo\games\GamesServer;
use lx\ResponseCodeEnum;
use lx\HttpResponseInterface;

class Respondent extends \lx\Respondent
{
    public function getConnectData(): HttpResponseInterface
    {
        $processes = $this->getService()->getConfig('processes');
        $serverConfig = $processes['games_server']['config'];
        return $this->prepareResponse([
            'protocol' => $serverConfig['protocol'],
            'port' => $serverConfig['port'],
            'channelName' => GamesServer::COMMON_CHANNEL_KEY,
        ]);
    }

    public function loadGamePlugin(string $gameType): HttpResponseInterface
    {
        $plugin = lx::$app->getService('lexedo/games')->gamesProvider->getGamePlugin($gameType);
        if (!$plugin) {
            return $this->prepareErrorResponse(
                'Game plugin not found',
                ResponseCodeEnum::NOT_FOUND,
            );
        }

        return $plugin->run();
    }
}
