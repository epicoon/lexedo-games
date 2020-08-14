<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\evolution\backend\game\Cart;
use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\PropertyBank;
use lexedo\games\GameChannel;

/**
 * Class EvolutionChannel
 * @package lexedo\games\evolution\backend
 */
class EvolutionChannel extends GameChannel
{
    /** @var Game */
    private $game;

    /**
     * @return array
     */
    public static function getConfigProtocol()
    {
        $protocol = parent::getConfigProtocol();
        $protocol['eventListener'] = ChannelEventListener::class;
        return $protocol;
    }

    public function init()
    {
        $this->game = new Game($this);
        $this->getEventListener()->setGame($this->game);
    }

    /**
     * @return ChannelEventListener
     */
    public function getEventListener()
    {
        /** @var ChannelEventListener $result */
        $result = $this->eventListener;
        return $result;
    }

    /**
     * @return array
     */
    public function getData()
    {
        return [
            'properties' => PropertyBank::$data,
        ];
    }

    protected function beginGame()
    {
        $event = $this->createEvent('game-begin');
        $this->game->fillNewPhaseEvent($event);
        $this->sendEvent($event);
    }

    /**
     * For development only!
     *
     * @param string $key
     * @return mixed|null
     */
    public function forDump($key)
    {
        switch ($key) {
            case 'game': return $this->game;

            default: return null;
        }
    }

    /**
     * @param string $gamerId
     */
    protected function onGamerDisconnect($gamerId)
    {
        $this->game->onGamerLeave($gamerId);
    }
}
