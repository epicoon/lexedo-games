<?php

namespace lexedo\games\actions;

use lx\socket\channel\ChannelEvent;
use lx\socket\Connection;

interface ConnectionDependentInterface
{
    public function processForConnection(Connection $connection, array $responseData): array;
    public function getConnectionLang(Connection $connection): string;
}
