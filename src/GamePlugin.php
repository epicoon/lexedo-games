<?php

namespace lexedo\games;

use lx\Plugin;

abstract class GamePlugin extends Plugin
{
    const ONLINE_ONLY = 1;
    const LOCAL_ONLY = 2;
    const ONLINE_AND_LOCAL = 3;

    private array $gameOptions;

    protected function init(): void
    {
        parent::init();

        $options = $this->getConfig('gameOptions');
        $validator = new GameOptionsValidator();
        if (!$validator->validate($options)) {
            throw new \Exception($validator->getError());
        }

        $this->gameOptions = $options;
    }

    public function getGameSlug(): string
    {
        return $this->gameOptions['slug'];
    }

    public function getTitleImage(): string
    {
        return $this->gameOptions['image'];
    }

    public function getGameConnectionType(): int
    {
        $online = $this->gameOptions['online'] ?? false;
        $offline = $this->gameOptions['offline'] ?? false;
        if ($online && $offline) {
            return self::ONLINE_AND_LOCAL;
        }
        if ($online) {
            return self::ONLINE_ONLY;
        }
        return self::LOCAL_ONLY;
    }

    public function getGameChannelClass(): ?string
    {
        if ($this->getGameConnectionType() == self::LOCAL_ONLY) {
            return null;
        }

        return $this->gameOptions['channel'];
    }

    public function getMinGamers(): string
    {
        return $this->gameOptions['minGamers'];
    }

    public function getMaxGamers(): string
    {
        return $this->gameOptions['maxGamers'];
    }
}
