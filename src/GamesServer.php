<?php

namespace lexedo\games;

use lx\socket\Connection;
use lx\socket\SocketServer;

class GamesServer extends SocketServer
{
    const COMMON_CHANNEL_KEY = 'common';

    private array $i18nReestr = [];

    public function getCommonChannel(): CommonChannel
    {
        /** @var CommonChannel $result */
        $result = $this->channels->get(self::COMMON_CHANNEL_KEY);
        return $result;
    }
    
    public function getUserAuthFieldByConnection(Connection $connection): ?string
    {
        $channel = $this->getCommonChannel();
        if (!$channel) {
            return null;
        }
        
        return $channel->getUserAuthFieldByConnection($connection);
    }

    /**
     * @param string $name
     * @return array
     */
    public function getI18nMap($name)
    {
        if (array_key_exists($name, $this->i18nReestr)) {
            return $this->i18nReestr[$name];
        }

        if (strpos($name, ':') === false) {
            $service = $this->getService($name);
            if (!$service) {
                return [];
            }

            $this->i18nReestr[$name] = $service->i18nMap;
        } else {
            $plugin = $this->getPlugin($name);
            if (!$plugin) {
                return [];
            }

            $this->i18nReestr[$name] = $plugin->i18nMap;
        }

        return $this->i18nReestr[$name];
    }

    protected function beforeProcess(): void
    {
        try {
            $this->channels->create(self::COMMON_CHANNEL_KEY, CommonChannel::class, [
                'reconnectionPeriod' => $this->getConfig('reconnectionPeriod') ?: 0,
            ]);
        } catch (\Exception $exception) {
            $this->logger->error($exception->getMessage());
            throw $exception;
        }
    }
}
