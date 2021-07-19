<?php

namespace lexedo\games;

use lx\ModelInterface;
use lx\socket\Connection;

abstract class AbstractGamer
{
    protected AbstractGame $game;
    protected Connection $connection;

    public function __construct(AbstractGame $game, Connection $connection)
    {
        $this->game = $game;
        $this->connection = $connection;
    }

    public function getGame(): AbstractGame
    {
        return $this->game;
    }

    public function getId(): string
    {
        return $this->connection->getId();
    }

    public function getUser(): ModelInterface
    {
        return $this->getGame()->getChannel()->getUser($this->connection);
    }
    
    public function getConnection(): Connection
    {
        return $this->connection;
    }
}
