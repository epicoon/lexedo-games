<?php

namespace lexedo\games;

/**
 * @method bool getPending()
 * @method bool getActive()
 * @method array getGamers()
 * @method bool getWaitingForRevenge()
 * @method array getRevengeApprovements()
 *
 * @method $this setPending(bool $value)
 * @method $this setActive(bool $value)
 * @method $this setGamers(array $gamers)
 * @method $this setWaitingForRevenge(bool $value)
 * @method $this setRevengeApprovements(array $approvements)
 */
abstract class AbstractGameCondition
{
    private ?array $_map = null;
    
    protected bool $isPending;
    protected bool $isActive;
    protected array $gamers;
    protected bool $isWaitingForRevenge;
    protected array $revengeApprovements;

    public function initByString(string $condition): void
    {
        $map = json_decode($condition, true);
        $fields = $this->getFields();
        foreach ($fields as $field) {
            if (array_key_exists($field, $map)) {
                $this->$field = $map[$field];
            }
        }
    }
    
    public function __construct(?AbstractGame $game = null)
    {
        if ($game) {
            $this
                ->setPending($game->isPending())
                ->setActive($game->isActive())
                ->setGamers($game->getGamers())
                ->setWaitingForRevenge($game->isWaitingForRevenge())
                ->setRevengeApprovements($game->getRevengeApprovements());
        }
    }
    
    protected function getFields(): array
    {
        return [
            'isPending',
            'isActive',
            'gamers',
            'isWaitingForRevenge',
            'revengeApprovements',
        ];
    }
    
    public function __call(string $methodName, array $arguments = [])
    {
        if (!preg_match('/^(get|set)/', $methodName)) {
            return;
        }

        $map = $this->getMap();
        $name = lcfirst(preg_replace('/^set/', '', $methodName));
        if (!array_key_exists($name, $map)) {
            $name = lcfirst(preg_replace('/^get/', '', $methodName));
            if (array_key_exists($name, $map)) {
                return $this->{$map[$name]};
            }
            return;
        }

        $this->{$map[$name]} = $arguments[0];
        return $this;
    }

    public function toArray(): array
    {
        $result = [];
        $fields = $this->getFields();
        foreach ($fields as $field) {
            if (property_exists($this, $field) && isset($this->$field)) {
                $result[$field] = $this->$field;
            }
        }
        return $result;
    }
    
    public function toString(): string
    {
        $array = $this->toArray();
        return json_encode($array);
    }

    private function getMap(): array
    {
        if ($this->_map === null) {
            $fields = $this->getFields();
            $map = [];
            foreach ($fields as $field) {
                $key = (preg_match('/^is[A-Z]/', $field))
                    ? lcfirst(preg_replace('/^is/', '', $field))
                    : $field;
                $map[$key] = $field;
            }
            $this->_map = $map;
        }

        return $this->_map;
    }
}
