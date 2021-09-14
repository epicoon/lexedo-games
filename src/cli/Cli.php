<?php

namespace lexedo\games\cli;

use lx\CliProcessor;
use lx\FusionComponentInterface;
use lx\FusionComponentTrait;
use lx\ServiceCliExecutor;
use lx\ServiceCliInterface;

class Cli implements FusionComponentInterface, ServiceCliInterface
{
    use FusionComponentTrait;

    public function getExtensionData(): array
    {
        return [
            [
                'command' => 'gen-game-plugin-backend',
                'description' => 'Generate backend for lexedo-game plugin',
                'arguments' => [
                    ServiceCliExecutor::getPluginArgument(),
                ],
                'handler' => GameBackendGenerator::class,
            ],
        ];
    }
}
