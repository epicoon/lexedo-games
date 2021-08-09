<?php

namespace lexedo\games;

use lx\ModelInterface;
use lx\socket\Connection;

abstract class AbstractGamer
{
    protected AbstractGame $game;
    protected Connection $connection;
    protected ModelInterface $user;
    protected string $id;

    public function __construct(AbstractGame $game, Connection $connection)
    {
        $this->game = $game;
        $this->connection = $connection;
        $this->user = $game->getChannel()->getUser($connection);
    }
    
    public function setId(string $id)
    {
        $this->id = $id;
    }
    
    public function getId(): string
    {
        return $this->id;
    }

    public function getGame(): AbstractGame
    {
        return $this->game;
    }

    public function getConnection(): Connection
    {
        return $this->connection;
    }

    public function getConnectionId(): string
    {
        return $this->connection->getId();
    }
    
    public function updateConnection(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function getUser(): ModelInterface
    {
        return $this->user;
    }
}
