<?php

namespace <<namespace>>;

use lexedo\games\AbstractGameCondition;

/**
 * @method int getExample()
 *
 * @method $this setExample(int $value)
 */
class <<ucslug>>GameCondition extends AbstractGameCondition
{
    protected function getFields(): array
    {
        return array_merge(parent::getFields(), [
            'example',
        ]);
    }
}
