<?php

namespace lexedo\games\actions;

use lx\ArrayHelper;
use lx\socket\Connection;

class Response implements ResponseInterface
{
    private ResponseAction $action;
    private iterable $data;
    /** @var array<Response>|null */
    private ?array $subResponses = null;

    public function __construct(ResponseAction $action, iterable $data)
    {
        $this->action = $action;
        $this->data = $data;
    }

    public function toArray(): array
    {
        $result = [
            'action' => $this->action->getName(),
            'actionData' => $this->getData(),
        ];

        $this->processSubActions();
        $subResponses = [];
        foreach ($this->subResponses as $name => $subResponse) {
            $subResponses[$name] = $subResponse->getData();
        }
        if (!empty($subResponses)) {
            $result['subActions'] = $subResponses;
        }

        return $result;
    }

    public function forConnection(Connection $connection): array
    {
        $result = [
            'action' => $this->action->getName(),
            'actionData' => ($this->action instanceof ConnectionDependentInterface)
                ? $this->action->processForConnection($connection, $this->getData())
                : $this->getData(),
        ];

        $this->processSubActions();
        $subResponses = [];
        foreach ($this->subResponses as $name => $subResponse) {
            $subAction = $subResponse->getAction();
            $subResponses[$name] = ($subAction instanceof ConnectionDependentInterface)
                ? $subAction->processForConnection($connection, $subResponse->getData())
                : $subResponse->getData();
        }
        if (!empty($subResponses)) {
            $result['subActions'] = $subResponses;
        }

        return $result;
    }

    public function isConnectionDependent(): bool
    {
        if ($this->action instanceof ConnectionDependentInterface) {
            return true;
        }

        $this->processSubActions();

        foreach ($this->subResponses as $response) {
            $subAction = $response->getAction();
            if ($subAction instanceof ConnectionDependentInterface) {
                return true;
            }
        }

        return false;
    }
    
    public function getData(): array
    {
        return ArrayHelper::iterableToArray($this->data);
    }

    public function getAction(): ResponseAction
    {
        return $this->action;
    }

    public function getSubResponses(): array
    {
        $this->processSubActions();
        return $this->subResponses;
    }

    public function processSubActions(): void
    {
        if ($this->subResponses !== null) {
            return;
        }

        $subActions = $this->action->getSubActions();
        if (empty($subActions)) {
            $this->subResponses = [];
            return;
        }

        $subResponses = [];

        /** @var AbstractAction $subAction */
        foreach ($subActions as $name => $subAction) {
            /** @var Response $subResponse */
            $subResponse = $subAction->run();

            $subResponses[$name] = $subResponse;
            $subSubResponses = $subResponse->getSubResponses();
            if (!empty($subSubResponses)) {
                $subResponses = array_merge($subResponses, $subSubResponses);
            }
        }

        $this->subResponses = $subResponses;
    }
}
