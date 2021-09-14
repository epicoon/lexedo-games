<?php

namespace lexedo\games\chesslike;

use lexedo\games\chesslike\backend\ChessChannel;
use lexedo\games\GamePlugin;

class Plugin extends GamePlugin
{
    public function getGameSlug(): string
    {
        return 'chess';
    }

    public function getTitleImage(): string
    {
        return 'chess.png';
    }

    public function getGameChannelClass(): string
    {
        return ChessChannel::class;
    }

    public function getMinGamers(): string
    {
        return 2;
    }

    public function getMaxGamers(): string
    {
        return 2;
    }
}
