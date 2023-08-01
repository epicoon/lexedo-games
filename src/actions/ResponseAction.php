<?php

namespace lexedo\games\actions;

use lx;
use lexedo\games\AbstractGame;
use lexedo\games\AbstractGamer;
use lexedo\games\GamePlugin;
use lexedo\games\GamesServer;

abstract class ResponseAction implements ResponseActionInterface
{
    private AbstractGame $game;
    private AbstractGamer $initiator;
    private string $name;
    private array $requestData = [];
    private array $subActions = [];
    private bool $successful = true;

    abstract protected function process(): array;

    /**
     * @abstract
     */
    static protected function getActionsMap(): array
    {
        return [];
    }

    public static function create(AbstractGame $game, string $actionName): ResponseAction
    {
        $map = static::getActionsMap();
        $actionClass = $map[$actionName] ?? DefaultAction::class;
        return new $actionClass($game, $actionName);
    }

    protected function __construct(AbstractGame $game, string $name)
    {
        $this->game = $game;
        $this->name = $name;
    }

    public function getPlugin(): GamePlugin
    {
        return $this->getGame()->getPlugin();
    }

    public function getGame(): AbstractGame
    {
        return $this->game;
    }

    public function setInitiator(AbstractGamer $gamer): void
    {
        $this->initiator = $gamer;
    }

    public function getInitiator(): AbstractGamer
    {
        return $this->initiator;
    }

    public function setRequestData(array $data): void
    {
        $this->requestData = $data;
    }

    public function getRequestData(): array
    {
        return $this->requestData;
    }

    public function run(): array
    {
        try {
            $result = $this->process();
        } catch (ActionException $exception) {
            lx::$app->log($exception->getMessageForLog(), 'action_error');
            $result = [
                'success' => false,
                'error' => $exception->getMessageForClient(),
            ];
            $this->successful = false;
        }
        return $this->serialize($result);
    }

    public function throwException(string $key, array $params = []): void
    {
        $exception = new ActionException($key, $params);
        $exception->setAction($this);
        throw $exception;
    }

    public function isSuccessful(): bool
    {
        return $this->successful;
    }

    public function getLang(): string
    {
        /** @var GamesServer $app */
        $app = lx::$app;
        $user = $this->getGame()->getChannel()->getUser($this->initiator->getConnection());
        $cookie = $app->getCommonChannel()->getUserCookie($user);
        return $cookie['lang'] ?? 'en-EN';
    }
    
    protected function addSubAction(string $actionName): void
    {
        $this->subActions[$actionName] = static::create($this->getGame(), $actionName);
    }

    private function serialize(array $response): array
    {
        $result = [
            'action' => $this->name,
            'actionData' => $response,
        ];

        if (!empty($this->subActions)) {
            $subActionsData = [];

            /** @var AbstractAction $subAction */
            foreach ($this->subActions as $name => $subAction) {
                $subData = $subAction->run();
                $subActionsData[$name] = $subData['actionData'];
                if (array_key_exists('subActions', $subData)) {
                    $subActionsData = array_merge($subActionsData, $subData['subActions']);
                }
            }

            $result['subActions'] = $subActionsData;
        }

        return $result;
    }
}
