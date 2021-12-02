<?php

namespace lexedo\games;

use lx\FlightRecorderHolderInterface;
use lx\FlightRecorderHolderTrait;

class GameOptionsValidator implements FlightRecorderHolderInterface
{
    use FlightRecorderHolderTrait;
    
    public function validate(?array $options): bool
    {
        if ($options === null) {
            $this->addFlightRecord('GamePlugin must have game options in the config file');
            return false;
        }

        $rules = [
            'required' => ['slug', 'image', 'minGamers', 'maxGamers'],
            'alternativeRequired' => [
                ['offline', 'online'],
            ],
            'conditionalRequired' => [
                [
                    'on' => ['online' => true],
                    'need' => 'channel',
                ]
            ],
        ];

        foreach ($rules['required'] as $rule) {
            if (!array_key_exists($rule, $options)) {
                $this->addFlightRecord('Options require parameter ' . $rule);
                return false;
            }
        }
        foreach ($rules['alternativeRequired'] as $alternatives) {
            $match = false;
            foreach ($alternatives as $alternative) {
                if (array_key_exists($alternative, $options)) {
                    $match = true;
                    break;
                }
            }
            if ($match === false) {
                $this->addFlightRecord(
                    'Options has to have at least one parameter from the list: '
                    . implode(',', $alternatives)
                );
                return false;
            }
        }
        foreach ($rules['conditionalRequired'] as $rule) {
            $condition = $rule['on'];
            $need = $rule['need'];
            $match = true;
            foreach ($condition as $key => $value) {
                if (!array_key_exists($key, $options) || $options[$key] !== $value) {
                    $match = false;
                    break;
                }
            }
            if ($match && !array_key_exists($need, $options)) {
                $this->addFlightRecord('Options has to have parameter ' . $need);
                return false;
            }
        }

        return true;
    }
    
    public function getError(): string
    {
        return $this->getFirstFlightRecord();
    }
}
