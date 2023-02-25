<?php

namespace lexedo\games\admin\actions;

use lexedo\games\admin\AdminHelper;
use lexedo\games\GameChannel;
use lexedo\games\GamesServer;
use lx;

class ActionGetChannelsData extends AbstractAdminAction
{
    /**
     * @return array|null
     */
    protected function process()
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        $channelNames = $app->channels->getChannelNames();

        $channelsData = [];
        foreach ($channelNames as $channelName) {
            if ($channelName == 'common') {
                continue;
            }
            
            /** @var GameChannel $channel */
            $channel = $app->channels->get($channelName);
            $channelsData[] = AdminHelper::getGameChannelData($channel);
        }

        return [
            'channels' => $channelsData,
        ];
    }
}
