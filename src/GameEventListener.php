<?php

namespace lexedo\games;

use lx\socket\channel\ChannelEvent;
use lx\socket\channel\ChannelEventListener;

class GameEventListener extends ChannelEventListener
{
    /**
     * @return AbstractGame
     */
    public function getGame()
    {
        return $this->getChannel()->getGame();
    }

    protected function getOfferTransitEventNames(string $scenarioName): array
    {
        return [
            $scenarioName . 'Offer',
            $scenarioName . 'Confirm',
            $scenarioName . 'Decline',
            $scenarioName . 'Final',
        ];
    }

    public function onAskForRevenge(ChannelEvent $event): void
    {
        $game = $this->getGame();
        $game->setRevenge($event->getData()['gamerId']);
        $event->setData($game->getRevengeData());
    }

    public function onRevengeVote(ChannelEvent $event): void
    {
        $game = $this->getGame();
        $data = $event->getData();
        if ($data['vote']) {
            $game->approveRevenge($data['gamerId']);
        } else {
            $game->declineRevenge($data['gamerId']);
        }
    }
}
