<?php

namespace lexedo\games\evolution\backend\game;

class Cart
{
    private int $id;
    private array $properties = [];

    public function __construct(int $id, int $prop1, ?int $prop2 = null)
    {
        $this->id = $id;
        $this->properties[] = $prop1;
        if ($prop2) {
            $this->properties[] = $prop2;
        }
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function hasProperty(int $type): bool
    {
        return in_array($type, $this->properties);
    }

    public function toArray(): array
    {
        return array_merge([$this->id], $this->properties);
    }
}
