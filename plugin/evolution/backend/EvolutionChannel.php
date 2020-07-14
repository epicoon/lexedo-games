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
        $this->game->prepare();
        $newCarts = $this->game->distributeCarts();

        $event = $this->createEvent('game-begin', [
            'activePhase' => $this->game->getActivePhase(),
            'turnSequence' => $this->game->getTurnSequence(),
        ]);

        foreach ($this->connections as $id => $connection) {
            $cartsData = [];
            /** @var Cart $cart */
            foreach ($newCarts[$id] as $cart) {
                $cartsData[] = $cart->toArray();
            }

            $event->setDataForConnection($id, [
                'carts' => $cartsData,
            ]);
        }

        $this->sendEvent($event);
    }
}
