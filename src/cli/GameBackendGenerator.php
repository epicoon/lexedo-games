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

        $slug = ucfirst(StringHelper::snakeToCamel($plugin->getGameSlug(), ['-', '_']));
        $namespace = ClassHelper::getNamespace($plugin);
        $pluginClass = get_class($plugin);

        $dir = $plugin->directory->get('server');
        $files = [
            'Channel',
            'EventListener',
            'Game',
            'GameCondition',
            'Gamer',
        ];
        foreach ($files as $fileName) {
            /** @var File $outFile */
            $outFile = $dir->makeFile($slug . $fileName . '.php');
            if ($outFile->exists()) {
                $this->processor->outln('File ' . $outFile->getPath() . ' already exists');
                continue;
            }

            $file = new File(__DIR__ . '/tpl/' . $fileName);
            $code = $file->get();
            $code = str_replace('<namespace>', $namespace, $code);
            $code = str_replace('<slug>', $slug, $code);
            $code = str_replace('<use_plugin>', $pluginClass, $code);

            $outFile->put($code);
            $this->processor->outln('File ' . $outFile->getPath() . ' created');
        }

        $this->processor->outln('Done');
    }
}
