<?php

namespace lexedo\games;

use lx\DataObject;

/**
 * @method string getConditionStatus()
 * @method array getGamers()
 * @method array getRevengeApprovements()
 *
 * @method $this setConditionStatus(string $value)
 * @method $this setGamers(array $gamers)
 * @method $this setRevengeApprovements(array $approvements)
 */
abstract class AbstractGameCondition
{
    private ?array $_map = null;
    private DataObject $data;

    public function initByString(string $condition): void
    {
        $map = json_decode($condition, true);
        $fields = $this->getFields();
        foreach ($fields as $field) {
            if (array_key_exists($field, $map)) {
                $this->data->$field = $map[$field];
            }
        }
    }
    
    public function __construct(?AbstractGame $game = null)
    {
        $this->data = new DataObject();
        if ($game) {
            $this
                ->setGamers($game->getGamers()->getGamersAsArray())
                ->setConditionStatus($game->getConditionStatus())
                ->setRevengeApprovements($game->getRevengeApprovements());
        }
    }
    
    protected function getFields(): array
    {
        return [
            'conditionStatus',
            'gamers',
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
                return $this->data->{$map[$name]};
            }
            return;
        }

        $this->data->{$map[$name]} = $arguments[0];
        return $this;
    }

    public function toArray(): array
    {
        $result = [];
        $fields = $this->getFields();
        foreach ($fields as $field) {
            $value = $this->data->$field;
            if ($value !== null) {
                $result[$field] = $value;
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
