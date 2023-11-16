<?php

namespace lexedo\games\actions;

use lx;
use lx\socket\Connection;

class ErrorResponse implements ResponseInterface
{
    private ActionException $exception;
    
    public function __construct(ActionException $exception)
    {
        $this->exception = $exception;
        lx::$app->log($exception->getMessageForLog(), 'action_error');
    }

    public function toArray(): array
    {
        return [
            'success' => false,
            'error' => $exception->getMessageForClient(),
        ];
    }

    public function forConnection(Connection $connection): array
    {
        return [];
    }

    public function isConnectionDependent(): bool
    {
        return false;
    }
}
