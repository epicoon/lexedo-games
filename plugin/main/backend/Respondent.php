<?php

namespace lexedo\games\main\backend;

use lx\ResponseCodeEnum;
use lx\ResponseInterface;

class Respondent extends \lx\Respondent
{
    public function getConnectData(): ResponseInterface
    {
        return $this->prepareResponse([
            'protocol' => 'ws',
            'port' => 8003,
            'channelName' => 'common',
        ]);
    }

    public function loadGamePlugin(string $gameType): ResponseInterface
    {
        $plugin = $this->app->getService('lexedo/games')->gamesProvider->getGamePlugin($gameType);
        if (!$plugin) {
            return $this->prepareErrorResponse(
                'Game plugin not found',
                ResponseCodeEnum::NOT_FOUND,
            );
        }

        return $plugin->run();
    }
}
