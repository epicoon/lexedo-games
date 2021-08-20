<?php

namespace lexedo\games;

use lx\socket\Connection;
use lx\socket\SocketServer;

class GamesServer extends SocketServer
{
    private array $i18nReestr = [];

    public function getCommonChannel(): CommonChannel
    {
        /** @var CommonChannel $result */
        $result = $this->channels->get('common');
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
        $this->channels->create('common', CommonChannel::class);
    }
}
