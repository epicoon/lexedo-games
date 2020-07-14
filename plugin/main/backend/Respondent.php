<?php

namespace lexedo\games\main\backend;

use lexedo\games\GamesProvider;
use lx\ResponseCodeEnum;
use lx\ResponseInterface;

class Respondent extends \lx\Respondent
{
    /**
     * @return array
     */
    public function getConnectData()
    {
        return [
            'port' => 8003,
            'channelName' => 'common',
        ];
    }

    /**
     * @param $gameType
     * @return ResponseInterface
     */
    public function loadGamePlugin($gameType)
    {
        $plugin = GamesProvider::getGamePlugin($gameType);
        if (!$plugin) {
            return $this->prepareErrorResponse(
                'Game plugin not found',
                ResponseCodeEnum::NOT_FOUND,
            );
        }

        return $plugin->run();
    }
}
