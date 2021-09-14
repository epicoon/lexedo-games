<?php

namespace lexedo\games\chesslike\backend;

use lexedo\games\GameChannel;
use lx\Math;
use lx\socket\Channel\ChannelEvent;

class ChessChannel extends GameChannel
{
    private ?string $activeGamer = null;

    protected function beginGame(): void
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

    private function onMovePiece(ChannelEvent $event): void
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
