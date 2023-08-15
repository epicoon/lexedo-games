<?php

namespace lexedo\games\cli;

use lx;
use lexedo\games\tools\PluginCreator;
use lx\ServiceCliExecutor;

class GameCodeGenerator extends ServiceCliExecutor
{
    private string $pluginName;
    private string $pluginDirName;
    private string $title;
    private string $slug;
    private string $fNamespace;
    private bool $online;
    private bool $local;
    private bool $actions;

    public function run(): void
    {
        $args = $this->getArgs();
        $this->pluginName = $args['plugin'];
        $this->title = $args['title'];
        $this->slug = ($args['slug'] !== '') ? $args['slug'] : $this->pluginName;
        $this->fNamespace = ($args['namespace'] !== '') ? $args['namespace'] : $this->slug;
        $this->online = !$args['online'];
        $this->local = !$args['local'];

        if ($this->online) {
            if (!array_key_exists('actions', $args)) {
                $this->processor->select(
                    'actions',
                    ['yes', 'no'],
                    'Do you want to use actions architecture?',
                    ['decor' => 'b']
                );
                return;
            }
        } else {
            // Select "no"
            $args['actions'] = 1;
        }
        if ($args['actions'] === null) {
            $this->processor->outln('Aborted');
            $this->processor->done();
            return;
        }
        $this->actions = array_key_exists('actions', $args)
            ? !$args['actions']
            : false;

        $this->defineService();
        $plugin = lx::$app->pluginProvider
            ->setService($this->service)
            ->setPluginName($this->pluginName)
            ->getPlugin();
        if ($plugin) {
            $this->processor->outln('Plugin ' . $plugin->name . ' already exists');
            $this->processor->done();
            return;
        }

        $pluginDirs = $this->service->getConfig('plugins');
        if ($pluginDirs) {
            $pluginDirs = (array)$pluginDirs;
        }
        if (!is_array($pluginDirs) || empty($pluginDirs)) {
            $this->processor->outln("Service configuration 'plugins' not found");
            $this->processor->done();
            return;
        }

        if (count($pluginDirs) == 1) {
            $args['index'] = 0;
            $this->pluginDirName = $pluginDirs[0];
        }

        if (!array_key_exists('index', $args)) {
            $dirsList = [];
            foreach ($pluginDirs as $dirPath) {
                $dirsList[] = $dirPath == '' ? '/' : $dirPath;
            }
            $this->processor->select(
                'index',
                $dirsList,
                'Choose directory for new plugin (relative to the service directory):',
                ['decor' => 'b']
            );
            return;
        }
        if ($args['index'] === null) {
            $this->processor->outln('Aborted');
            $this->processor->done();
            return;
        }
        $this->pluginDirName = $pluginDirs[$args['index']];

        (new PluginCreator($this->toArray()))->create();
        $this->processor->outln('Done');
    }

    private function toArray(): array
    {
        return [
            'service' => $this->service,
            'pluginName' => $this->pluginName,
            'pluginDirName' => $this->pluginDirName,
            'title' => $this->title,
            'slug' => $this->slug,
            'fNamespace' => $this->fNamespace,
            'online' => $this->online,
            'local' => $this->local,
            'actions' => $this->actions,
        ];
    }
}
