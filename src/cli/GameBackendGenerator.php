<?php

namespace lexedo\games\cli;

use lexedo\games\GamePlugin;
use lx\ClassHelper;
use lx\ServiceCliExecutor;
use lx\StringHelper;
use lx\File;

class GameBackendGenerator extends ServiceCliExecutor
{
    public function run(): void
    {
        if (!$this->definePlugin()) {
            $this->processor->outln('Choose a plugin');
            return;
        }

        /** @var GamePlugin $plugin */
        $plugin = $this->plugin;
        if (!($plugin instanceof GamePlugin)) {
            $this->processor->outln('The plugin has to be extended from ' . GamePlugin::class);
            return;
        }

        if ($plugin->directory->contains('backend')) {
            $this->processor->outln('The plugin already has backend directory');
            return;
        }

        $slug = ucfirst(StringHelper::snakeToCamel($plugin->getGameSlug(), ['-', '_']));
        $namespace = ClassHelper::getNamespace($plugin) . '\\backend';
        $pluginClass = get_class($plugin);

        $backend = $plugin->directory->makeDirectory('backend');
        $files = [
            'Channel',
            'EventListener',
            'Game',
            'GameCondition',
            'Gamer',
        ];
        foreach ($files as $fileName) {
            $file = new File(__DIR__ . '/tpl/' . $fileName);
            $code = $file->get();
            $code = str_replace('<namespace>', $namespace, $code);
            $code = str_replace('<slug>', $slug, $code);
            $code = str_replace('<use_plugin>', $pluginClass, $code);

            $outFile = $backend->makeFile($slug . $fileName . '.php');
            $outFile->put($code);
        }

        $this->processor->outln('Done');
    }
}
