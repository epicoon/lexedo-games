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

    abstract protected function process(): Response;

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

    public function getName(): string
    {
        return $this->name;
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
    
    public function run(): ResponseInterface
    {
        try {
            $response = $this->process();
            $response->processSubActions();
        } catch (ActionException $exception) {
            $this->successful = false;
            return new ErrorResponse($exception);
        }
        return $response;
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

    public function getSubActions(): array
    {
        return $this->subActions;
    }

    protected function addSubAction(string $actionName): void
    {
        $this->subActions[$actionName] = static::create($this->getGame(), $actionName);
    }
    
    protected function prepareResponse(iterable $data): Response
    {
        return new Response($this, $data);
    }

    protected function emptyResponse(): Response
    {
        return new Response($this, []);
    }
}
