<?php

namespace lexedo\games;

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
}
