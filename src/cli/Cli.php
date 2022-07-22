<?php

namespace lexedo\games\cli;

use lx\CommandArgument;
use lx\CliProcessor;
use lx\FusionComponentInterface;
use lx\FusionComponentTrait;
use lx\ServiceCliInterface;

class Cli implements FusionComponentInterface, ServiceCliInterface
{
    use FusionComponentTrait;

    public function getCliCommandsConfig(): array
    {
        return [
            [
                'command' => 'gen-game-plugin-backend',
                'description' => 'Generate backend for lexedo-game plugin',
                'arguments' => [
                    CommandArgument::getPluginArgument(),
                ],
                'handler' => GameBackendGenerator::class,
            ],
        ];
    }
}
