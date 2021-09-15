<?php

namespace lexedo\games;

use lx\Plugin;

abstract class GamePlugin extends Plugin
{
    const ONLINE_ONLY = 1;
    const LOCAL_ONLY = 2;
    const ONLINE_AND_LOCAL = 3;
    
    abstract public function getGameSlug(): string;
    abstract public function getTitleImage(): string;
    abstract public function getGameConnectionType(): int;
    abstract public function getGameChannelClass(): ?string;
    abstract public function getMinGamers(): string;
    abstract public function getMaxGamers(): string;
}
