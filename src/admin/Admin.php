<?php

namespace lexedo\games\admin;

use lx\socket\Connection;
use lx\UserInterface;

class Admin
{
    private UserInterface $user;
    private Connection $connection;
    private array $cookie;
    private ?string $_isWatchingForChannel = null;

    public function __construct(UserInterface $user, Connection $connection, array $cookie)
    {
        $this->user = $user;
        $this->connection = $connection;
        $this->cookie = $cookie;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    public function watchForChannel(?string $channelName): void
    {
        $this->_isWatchingForChannel = $channelName;
    }

    public function isWatchingForChannel(string $channelName): bool
    {
        return $this->_isWatchingForChannel == $channelName;
    }
}
