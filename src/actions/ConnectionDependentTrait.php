<?php

namespace lexedo\games\actions;

use lexedo\games\CommonChannel;
use lexedo\games\GameChannel;
use lx\socket\Connection;

trait ConnectionDependentTrait
{
    public function getConnectionLang(Connection $connection): string
    {
        /** @var GameChannel $gameChannel */
        $gameChannel = $connection->getClientChannel();

        $user = $gameChannel->getUser($connection);
        if (!$user) {
            return 'en-EN';
        }

        /** @var CommonChannel $commonChannel */
        $commonChannel = $gameChannel->getCommonChannel();
        $cookie = $commonChannel->getUserCookie($user);
        return $cookie['lang'] ?? 'en-EN';
    }
}
