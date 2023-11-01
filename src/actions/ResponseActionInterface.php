<?php

namespace lexedo\games\actions;

use lexedo\games\AbstractGame;
use lexedo\games\AbstractGamer;
use lexedo\games\GamePlugin;

interface ResponseActionInterface
{
    public static function create(AbstractGame $game, string $actionName): ResponseAction;
    public function getName(): string;
    public function getPlugin(): GamePlugin;
    public function getGame(): AbstractGame;
    public function setInitiator(AbstractGamer $gamer): void;
    public function getInitiator(): AbstractGamer;
    public function setRequestData(array $data): void;
    public function getRequestData(): array;
    public function run(): ResponseInterface;
    public function throwException(string $key, array $params = []): void;
    public function isSuccessful(): bool;
    public function getLang(): string;
}
