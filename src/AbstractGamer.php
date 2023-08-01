<?php

namespace lexedo\games;

use lx;
use lx\ModelInterface;
use lx\socket\Connection;

abstract class AbstractGamer
{
    protected AbstractGame $game;
    protected ?GameChannelUser $gameChannelUser;
    /** @var mixed */
    protected $authField;
    protected string $id;

    public function __construct(AbstractGame $game, ?Connection $connection = null, $authField = null)
    {
        $this->game = $game;

        $this->gameChannelUser = $connection ? $game->getChannel()->getGameChannelUser($connection) : null;
        if ($this->gameChannelUser) {
            $user = $this->gameChannelUser->getUser();
            /** @var lx\UserManagerInterface $userManager */
            $userManager = lx::$app->userManager;
            $this->authField = $userManager->getAuthField($user);
        } else {
            $this->authField = $authField;
        }

        $this->init();
    }

    abstract public function restore(array $config): void;

    protected function init(): void
    {
        // pass
    }

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getAuthField()
    {
        return $this->authField;
    }
    
    public function getId(): string
    {
        return $this->id;
    }

    public function getGame(): AbstractGame
    {
        return $this->game;
    }

    public function getConnection(): ?Connection
    {
        return $this->gameChannelUser ? $this->gameChannelUser->getConnection() : null;
    }

    public function getConnectionId(): ?string
    {
        $connection = $this->getConnection();
        return $connection ? $connection->getId() : null;
    }

    public function updateByConnection(Connection $connection): void
    {
        $this->gameChannelUser = $this->getGame()->getChannel()->getGameChannelUser($connection);
    }

    public function getUser(): ?ModelInterface
    {
        return $this->gameChannelUser ? $this->gameChannelUser->getUser() : null;
    }

    public function getGameChannelUser(): GameChannelUser
    {
        return $this->gameChannelUser;
    }

    public function toArray(): array
    {
        return [
            'gamerId' => $this->getId(),
            'authField' => $this->getAuthField(),
        ];
    }
}
