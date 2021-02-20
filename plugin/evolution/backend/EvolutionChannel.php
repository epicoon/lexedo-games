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

    public static function getConfigProtocol(): array
    {
        return array_merge(parent::getConfigProtocol(), [
            'eventListener' => ChannelEventListener::class,
        ]);
    }

    public function init()
    {
        $this->game = new Game($this);
    }

    /**
     * @return Game
     */
    public function getGame()
    {
        return $this->game;
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
        $this->game->prepareLogEvent('logMsg.begin', [], $event);
        $this->sendEvent($event);
    }

    /**
     * @param string $gamerId
     */
    protected function onGamerDisconnect($gamerId)
    {
        $this->game->onGamerLeave($gamerId);
    }
}
