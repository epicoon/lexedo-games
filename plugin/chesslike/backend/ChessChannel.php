<?php

namespace lexedo\games\chesslike\backend;

use lexedo\games\GameChannel;
use lx\Math;
use lx\socket\Channel\ChannelEvent;

/**
 * Class WebSocketChannel
 * @package lexedo\games\chesslike\backend
 */
class ChessChannel extends GameChannel
{
    /** @var string */
    private $activeGamer = null;

    protected function beginGame()
    {
        $arr = ['white', 'black'];
        $this->activeGamer = 'white';

        $event = $this->createEvent('game-begin', [
            'activeGamer' => $this->activeGamer,
        ]);

        foreach ($this->connections as $id => $connection) {
            if (count($arr) == 2) {
                $index = Math::gamble(0.5) ? 0 : 1;
                $color = $arr[$index];
                unset($arr[$index]);
                $arr = array_values($arr);
            } else {
                $color = $arr[0];
            }

            $event->setDataForConnection($connection, ['color' => $color]);
        }

        $this->sendEvent($event);
    }

    /**
     * @param ChannelEvent $event
     */
    private function onMovePiece($event)
    {
        $data = $event->getData();
        if ($data['color'] != $this->activeGamer) {
            $event->replaceEvent('error', [
                'message' => 'It\'s not your turn',
            ]);
            return;
        }

        $event->replaceEvent('movePiece', $data);

        $this->activeGamer = ($this->activeGamer == 'white')
            ? 'black'
            : 'white';
    }

    public function onEvent(ChannelEvent $event): void
    {
        switch ($event->getName()) {
            case 'move-piece':
                $this->onMovePiece($event);
                break;

            default:
                $event->replaceEvent('error', ['message' => 'Unknown event']);
        }

        $this->sendEvent($event);
    }
}
