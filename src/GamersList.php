<?php

namespace lexedo\games;

use lx\ArrayInterface;
use lx\ArrayTrait;

/**
 * @method AbstractGamer pop()
 * @method AbstractGamer shift()
 * @method AbstractGamer getFirst()
 * @method AbstractGamer getLast()
 * @method AbstractGamer getCurrent()
 * @method AbstractGamer getNext()
 * @method AbstractGamer getPrev()
 * @method string getKeyByValue(AbstractGamer $value)
 * @method void removeValue(AbstractGamer $value)
 * @method bool contains(AbstractGamer $value)
 * @method AbstractGamer offsetGet(string $offset)
 * @method void offsetSet(string $offset, AbstractGamer $value)
 * @method bool offsetExists(string $offset)
 * @method void offsetUnset(string $offset)
 */
class GamersList implements ArrayInterface
{
    use ArrayTrait;

    public function getGamersAsArray(): array
    {
        $this->dropPointer();
        $map = [];
        while ($gamer = $this->getNext()) {
            $map[$gamer->getId()] = $gamer->toArray();
        }
        return $map;
    }
}
