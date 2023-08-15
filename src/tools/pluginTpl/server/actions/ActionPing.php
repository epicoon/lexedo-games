<?php

namespace <<namespace>>\actions;

class ActionPing extends AbstractAction
{
    protected function process(): array
    {
        return [
            'response' => 'pong',
        ];
    }
}
