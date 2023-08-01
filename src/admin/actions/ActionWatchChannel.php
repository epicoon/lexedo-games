<?php

namespace lexedo\games\admin\actions;

use lexedo\games\admin\AdminHelper;
use lexedo\games\GameChannel;
use lexedo\games\GamesServer;
use lx;
use lx\ObjectMapper;

class ActionWatchChannel extends AbstractAdminAction
{
    /**
     * @return array|null
     */
    protected function process()
    {
        $request = $this->request;
        $data = $request->getData();

        /** @var GamesServer $app */
        $app = lx::$app;
        /** @var GameChannel $gameChannel */
        $gameChannel = $app->channels->get($data['channelName']);

        return [
            'connections' => $this->getConnections($gameChannel),
            'channel' => $this->getChannelCondition($gameChannel),
        ];
    }

    private function getConnections(GameChannel $gameChannel): array
    {
        $this->getAdmin()->watchForChannel($gameChannel->getName());
        $connections = [];
        foreach ($gameChannel->getConnections() as $connection) {
            $connections[] = AdminHelper::getGameChannelConnectionData($gameChannel, $connection);
        }
        return $connections;
    }

    private function getChannelCondition(GameChannel $gameChannel): array
    {
        $mapper = new ObjectMapper();
        return $mapper->setObject($gameChannel)
            ->ignoreInstanses([
                lx\socket\Connection::class,
            ])->skipProperties([
                'delegateList',
                'objectDependencies',
                'lazyStrongDependencies',
                'lazyWeakDependencies',
                'name',
                'connections',
                'formerConnectionIds',
                'eventListener',
                'requestHandler',
                'timerStart',
                'createdAt',
                'plugin',
                'users',
                'game' => [
                    '_plugin',
                    '_channel',
                    'userToGamerMap',
                ],
            ])->getResult()
            ->toArray();
    }
}
