<?php

namespace lexedo\games\actions;

use lx;

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
}
