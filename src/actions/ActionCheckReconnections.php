<?php

namespace lexedo\games\actions;

class ActionCheckReconnections extends AbstractAction
{
    /**
     * @return array
     */
    public function run()
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
