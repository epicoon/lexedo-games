<?php

namespace lexedo\games\commonRequestHandler;

use Throwable;
use lexedo\games\CommonChannel;
use lx\FlightRecorderHolderInterface;
use lx\FlightRecorderHolderTrait;
use lx\socket\channel\request\ChannelRequest;

class RequestHandler implements FlightRecorderHolderInterface
{
    use FlightRecorderHolderTrait;

    private CommonChannel $channel;

    public function __construct(CommonChannel $channel)
    {
        $this->channel = $channel;
    }

    /**
     * @return mixed|null
     */
    public function handleRequest(ChannelRequest $request)
    {
        $this->resetFlightRecords();

        $action = ActionFactory::getAction($this->channel, $request);
        if (!$action) {
            $this->addFlightRecord('Action not found');
            return null;
        }

        try {
            return $action->run();
        } catch (Throwable $exception) {
            $this->addFlightRecord($exception->getMessage());
            return null;
        }
    }
}
