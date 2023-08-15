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
                'command' => ['new-lexedo-game-plugin', 'n'],
                'description' => 'Generate code for lexedo-game plugin',
                'arguments' => [
                    CommandArgument::service()->setMandatory(),
                    CommandArgument::plugin()->useInput()->setMandatory(),
                    CommandArgument::string(['title'])->useInput()->setMandatory()
                        ->setDescription('The game name'),
                    CommandArgument::string(['slug'])->useInput()
                        ->setDescription('Game slug, if empty is equal to plugin name'),
                    CommandArgument::string(['namespace', 'n'])->useInput()
                        ->setDescription('Fronted namespace, if empty is equal to slug'),
                    CommandArgument::flag(['online', 'o'])->useSelect(['yes', 'no'])
                        ->setDescription('The game supports online mode'),
                    CommandArgument::flag(['local', 'l'])->useSelect(['yes', 'no'])
                        ->setDescription('The game supports local mode'),
                    CommandArgument::flag(['actions', 'a'])
                        ->setDescription('The game uses actions architecture'),
                    CommandArgument::integer(['index', 'i'])
                        ->setDescription('Index of server plugins directory')
                ],
                'handler' => GameCodeGenerator::class,
            ],
        ];
    }
}
