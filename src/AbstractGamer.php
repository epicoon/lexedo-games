<?php

namespace lexedo\games;

use lx;
use lx\ModelInterface;
use lx\socket\Connection;

abstract class AbstractGamer
{
    protected AbstractGame $game;
    protected ?Connection $connection;
    protected ?ModelInterface $user;
    /** @var mixed */
    protected $authField;
    protected string $id;

    public function __construct(AbstractGame $game, ?Connection $connection = null, $authField = null)
    {
        $this->game = $game;
        $this->connection = $connection;
        $this->user = $connection ? $game->getChannel()->getUser($connection) : null;
        if ($this->user) {
            /** @var lx\UserManagerInterface $userManager */
            $userManager = lx::$app->userManager;
            $this->authField = $userManager->getAuthField($this->user);
        } else {
            $this->authField = $authField;
        }
    }
    
    abstract function init(array $config): void;
    
    public function setId(string $id)
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
        return $this->connection;
    }

    public function getConnectionId(): ?string
    {
        return $this->connection ? $this->connection->getId() : null;
    }
    
    public function updateConnection(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function getUser(): ?ModelInterface
    {
        return $this->user;
    }
}
