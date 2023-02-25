<?php

namespace lexedo\games;

use lx\ModelInterface;
use lx\socket\Connection;

class GameChannelUser
{
    const TYPE_AUTHOR = 'author';
    const TYPE_PARTICIPANT = 'participant';
    const TYPE_OBSERVER = 'observer';

    private ModelInterface $user;
    private string $type;
    private ?Connection $connection = null;

    public function __construct(ModelInterface $user, string $type)
    {
        $this->user = $user;
        $this->type = $type;
    }

    public function isConnected(): bool
    {
        return $this->connection !== null;
    }

    public function isAuthor(): bool
    {
        return $this->type == self::TYPE_AUTHOR;
    }

    public function isParticipant(): bool
    {
        return $this->type == self::TYPE_PARTICIPANT;
    }

    public function isObserver(): bool
    {
        return $this->type == self::TYPE_OBSERVER;
    }

    public function isGamer(): bool
    {
        return $this->isAuthor() || $this->isParticipant();
    }

    public function connect(Connection $connection): void
    {
        $this->connection = $connection;
    }

    public function disconnect(): void
    {
        $this->connection = null;
    }

    public function getUser(): ModelInterface
    {
        return $this->user;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getConnection(): ?Connection
    {
        return $this->connection;
    }
}
