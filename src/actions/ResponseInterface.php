<?php

namespace lexedo\games\actions;

use lx\socket\Connection;

interface ResponseInterface
{
    public function toArray(): array;
    public function forConnection(Connection $connection): array;
    public function isConnectionDependent(): bool;
}
