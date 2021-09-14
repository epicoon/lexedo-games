<?php

namespace lexedo\games\evolution;

use lexedo\games\evolution\backend\EvolutionChannel;
use lexedo\games\GamePlugin;

class Plugin extends GamePlugin
{
    public function getGameSlug(): string
    {
        return 'evolution';
    }

    public function getTitleImage(): string
    {
        return 'evolution.png';
    }

    public function getGameChannelClass(): string
    {
        return EvolutionChannel::class;
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
