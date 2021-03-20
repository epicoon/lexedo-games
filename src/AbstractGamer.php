<?php

namespace lexedo\games;

use lx\ModelInterface;
use lx\socket\Connection;

/**
 * Class AbstractGamer
 * @package lexedo\games
 */
abstract class AbstractGamer
{
    protected AbstractGame $game;
    protected Connection $connection;

    /**
     * Gamer constructor.
     * @param AbstractGame $game
     * @param Connection $connection
     */
    public function __construct($game, $connection)
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
}
