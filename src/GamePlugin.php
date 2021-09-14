<?php

namespace lexedo\games;

use lx\Plugin;

abstract class GamePlugin extends Plugin
{
    abstract public function getGameSlug(): string;
    abstract public function getTitleImage(): string;
    abstract public function getGameChannelClass(): string;
    abstract public function getMinGamers(): string;
    abstract public function getMaxGamers(): string;
}
