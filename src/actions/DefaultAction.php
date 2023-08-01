<?php

namespace lexedo\games\actions;

class DefaultAction extends ResponseAction
{
    protected function process(): array
    {
        return $this->getRequestData();
    }
}
