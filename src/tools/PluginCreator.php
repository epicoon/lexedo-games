<?php

namespace lexedo\games\tools;

use lx\ClassHelper;
use lx\Directory;
use lx\File;
use lx\PluginEditor;
use lx\Service;

class PluginCreator
{
    private Service $service;
    private string $pluginName;
    private string $pluginDirName;
    private string $title;
    private string $slug;
    private string $fNamespace;
    private bool $online;
    private bool $local;
    private bool $actions;

    public function __construct(array $config)
    {
        foreach ($config as $name => $value) {
            if (property_exists($this, $name)) {
                $this->$name = $value;
            }
        }
    }

    public function create(): void
    {
        $editor = new PluginEditor($this->service);
        $editor
            ->buildConfig(false)
            ->buildRespondent(false)
            ->buildSnippets(false)
            ->buildClient(false);
        $plugin = $editor->createPlugin($this->pluginName, $this->pluginDirName);

        $replacements = [
            'serviceName' => $this->service->name,
            'pluginName' => $this->pluginName,
            'title' => $this->title,
            'offline' => $this->local ? 'true' : 'false',
            'online' => $this->online ? 'true' : 'false',
            'namespace' => ClassHelper::getNamespace($plugin),
            'front_namespace' => $this->fNamespace,
            'slug' => $this->slug,
            'ucslug' => ucfirst($this->slug),
        ];

        $dir = $this->actions
            ? new Directory(__DIR__ . '/pluginTplActions')
            : new Directory(__DIR__ . '/pluginTpl');

        $files = $dir->getAllFiles();
        /** @var File $tplFile */
        foreach ($files as $tplFile) {
            $path = $tplFile->getRelativePath($dir);
            $content = $tplFile->get();
            foreach ($replacements as $key => $replacement) {
                $content = str_replace("<<$key>>", $replacement, $content);
            }
            $path = str_replace('__', $replacements['ucslug'], $path);

            $file = $plugin->directory->makeFile($path);
            $file->put($content);
        }
    }
}
