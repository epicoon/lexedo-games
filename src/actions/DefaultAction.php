<?php

namespace lexedo\games\actions;

class DefaultAction extends ResponseAction
{
    protected function process(): Response
    {
        return $this->prepareResponse($this->getRequestData());
    }
}
