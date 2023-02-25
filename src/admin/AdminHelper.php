<?php

namespace lexedo\games\admin;

use lx;
use lx\PluginAssetProvider;
use lexedo\games\GameChannel;
use lx\socket\Connection;

class AdminHelper
{
    public static function getGameChannelData(GameChannel $channel): array
    {
        $gamePlugin = $channel->getGamePlugin();
        $assetProvider = new PluginAssetProvider($gamePlugin);

        return [
            'gameType' => $channel->getType(),
            'icon' => $assetProvider->getImageLink($gamePlugin->getTitleImage()),
            'channelName' => $channel->getName(),
            'gameName' => $channel->getCurrentGameName(),
            'date' => $channel->createdAt()->format('Y-m-d H:i:s'),
        ];
    }

    public static function getGameChannelConnectionData(GameChannel $channel, Connection $connection): array
    {
        $user = $channel->getUser($connection);
        /** @var lx\UserManagerInterface $userManager */
        $userManager = lx::$app->userManager;
        return [
            'userId' => $user->getId(),
            'userAuthValue' => $userManager->getAuthField($user),
            'connectionId' => $connection->getId(),
            'type' => $channel->getGameChannelUser($connection)->getType(),
            'date' => $connection->createdAt()->format('Y-m-d h:i:s'),
        ];
    }

    /**
     * @param Admin[] $admins
     * @param GameChannel $gameChannel
     * @return Connection[]
     */
    public static function getGameChannelWatchers(array $admins, GameChannel $gameChannel): array
    {
        $result = [];
        foreach ($admins as $admin) {
            if ($admin->isWatchingForChannel($gameChannel->getName())) {
                $result[] = $admin->getConnection();
            }
        }
        return $result;
    }
}
