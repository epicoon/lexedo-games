<?php

namespace lexedo\games\sapper;

use lexedo\games\GamePlugin;

class Plugin extends GamePlugin
{
    public function getGameSlug(): string
    {
        return 'sapper';
    }

    public function getTitleImage(): string
    {
        return 'sapper.png';
    }

    public function getGameConnectionType(): int
    {
        return self::LOCAL_ONLY;
    }

    public function getGameChannelClass(): ?string
    {
        return null;
    }

    public function getMinGamers(): string
    {
        return 1;
    }

    public function getMaxGamers(): string
    {
        return 1;
    }
}
