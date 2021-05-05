<?php

namespace lexedo\games;

use lx\socket\SocketServer;

/**
 * Class GamesServer
 * @package lexedo\games
 */
class GamesServer extends SocketServer
{
    /** @var array */
    private $i18nReestr = [];

    /**
     * @return CommonChannel
     */
    public function getCommonChannel()
    {
        /** @var CommonChannel $result */
        $result = $this->channels->get('common');
        return $result;
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
