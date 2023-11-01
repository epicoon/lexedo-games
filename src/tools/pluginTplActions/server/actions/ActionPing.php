<?php

namespace <<namespace>>

use lexedo\games\actions\Response;

\actions;

class ActionPing extends AbstractAction
{
    protected function process(): Response
    {
        return $this->prepareResponse([
            'response' => 'pong',
        ]);
    }
}
