<?php

namespace lexedo\games\commonRequestHandler\actions;

class ActionCheckReconnections extends AbstractAction
{
    /**
     * @return array
     */
    protected function process()
    {
        $connection = $this->request->getInitiator();
        $user = $this->channel->getUser($connection);
        $list = [];
        foreach ($this->channel->getStuffedGames() as $gameChannel) {
            if ($gameChannel->userIsDisconnected($user)) {
                $list[] = [
                    'channelKey' => $gameChannel->getName(),
                    'type' => $gameChannel->getParameter('type'),
                    'name' => $gameChannel->getParameter('name'),
                ];
            }
        }

        return $list;
    }
}
