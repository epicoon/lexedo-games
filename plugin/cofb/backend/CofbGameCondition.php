<?php

namespace lexedo\games\cofb\backend;

use lexedo\games\AbstractGameCondition;

class CofbGameCondition extends AbstractGameCondition
{
    protected function getFields(): array
    {
        return array_merge(parent::getFields(), [
            //TODO
        ]);
    }
}
