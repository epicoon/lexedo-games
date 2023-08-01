<?php

namespace lexedo\games\actions;

use Exception;

class ActionException extends Exception
{
    private ?ResponseAction $action = null;
    private array $params;
    private ?string $clientMessage = null;

    public function __construct(string $message, array $params = [])
    {
        parent::__construct($message);
        $this->params = $params;
    }

    public function setAction(ResponseAction $action): void
    {
        $this->action = $action;
    }
    
    public function getParams(): array
    {
        return $this->params;
    }

    public function getMessageForLog(): string
    {
        return $this->action
            ? $this->getMessageForClient(false) . '; request data: ' . json_encode($this->action->getRequestData())
            : $this->getMessageForClient();
    }
    
    public function getMessageForClient(bool $local = true): string
    {
        if ($this->clientMessage === null) {
            $plugin = $this->action->getPlugin();
            $this->clientMessage = $plugin->i18nMap->localizeKey(
                $this->getMessage(),
                $this->getParams(),
                $local ? $this->action->getLang() : null
            );
        }

        return $this->clientMessage;
    }
}
