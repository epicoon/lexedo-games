<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\Gamer;
use lexedo\games\evolution\backend\game\PropertyBank;
use lx\socket\Channel\ChannelEvent;

/**
 * Class ChannelEventListener
 * @package lexedo\games\evolution\backend
 */
class ChannelEventListener extends \lx\socket\Channel\ChannelEventListener
{
    /** @var Game */
    private $game;

    /**
     * @param Game $game
     */
    public function setGame($game)
    {
        $this->game = $game;
    }

    /**
     * @return array
     */
    public function getAvailableEventNames()
    {
        return ['chat-message'];
    }

    /**
     * @param ChannelEvent $event
     */
    public function onCartToCreature($event)
    {
        $gamer = $this->checkGamerInPhase(Game::PHASE_GROW, $event);
        if (!$gamer) {
            return;
        }

        $data = $event->getData();
        $cart = $gamer->getCartById($data['cart']);
        if (!$cart) {
            $event->replaceEvent('error', [
                'message' => 'Cart not found',
            ]);
            return;
        }

        $creature = $gamer->cartToCreature($cart);
        $event->addData([
            'creatureId' => $creature->getId(),
        ]);

        $this->onGrowPhaseAction($event, $gamer);
    }

    /**
     * @param ChannelEvent $event
     */
    public function onCartToProperty($event)
    {
        $gamer = $this->checkGamerInPhase(Game::PHASE_GROW, $event);
        if (!$gamer) {
            return;
        }

        $data = $event->getData();
        $cart = $gamer->getCartById($data['cart']);
        if (!$cart) {
            $event->replaceEvent('error', [
                'message' => 'Cart not found',
            ]);
            return;
        }

        if (!$cart->hasProperty($data['property'])) {
            $event->replaceEvent('error', [
                'message' => 'Cart hasn\'t this property',
            ]);
            return;
        }

        $isFriendly = PropertyBank::isFriendly($data['property']);
        if (
            ($isFriendly && $data['gamer'] != $data['creatureGamer'])
            || (!$isFriendly && $data['gamer'] == $data['creatureGamer'])
        ) {
            $event->replaceEvent('error', [
                'message' => 'Creature owner is wrong',
            ]);
            return;
        }

        $creatureOwner = $this->game->getGamerById($data['creatureGamer']);
        if (!$creatureOwner) {
            $event->replaceEvent('error', [
                'message' => 'Creature owner not found',
            ]);
            return;
        }

        $creature = $creatureOwner->getCreatureById($data['creature']);
        if (!$creature) {
            $event->replaceEvent('error', [
                'message' => 'Creature not found',
            ]);
            return;
        }

        if (!$creature->canAttachProperty($data['property'])) {
            $event->replaceEvent('error', [
                'message' => 'Creature can not attach this property',
            ]);
            return;
        }

        $gamer->dropCart($cart);
        $property = $creature->addProperty($data['property']);
        $event->addData([
            'propertyId' => $property->getId(),
        ]);

        $this->onGrowPhaseAction($event, $gamer);
    }

    /**
     * @param ChannelEvent $event
     */
    public function onFeedCreature($event)
    {
        $gamer = $this->checkGamerInPhase(Game::PHASE_FEED, $event);
        if (!$gamer) {
            return;
        }

        if (!$this->game->getFoodCount()) {
            $event->replaceEvent('error', [
                'message' => 'There is no food',
            ]);
            return;
        }

        $data = $event->getData();
        $creature = $gamer->getCreatureById($data['creature']);
        if (!$creature) {
            $event->replaceEvent('error', [
                'message' => 'Creature not found',
            ]);
            return;
        }

        if (!$creature->canEat()) {
            $event->replaceEvent('error', [
                'message' => 'Creature is not hungry',
            ]);
            return;
        }

        $feedReport = $this->game->feedCreature($creature);
        if (!$feedReport) {
            $event->replaceEvent('error', [
                'message' => 'Problem while creature feed',
            ]);
            return;
        }

        $event->addData([
            'currentFood' => $this->game->getFoodCount(),
            'feedReport' => $feedReport,
        ]);

        $this->onFeedPhaseAction($event, $gamer);
    }

    /**
     * @param ChannelEvent $event
     */
    public function onGamerPass($event)
    {
        $gamer = $this->checkGamerInPhase(Game::PHASE_GROW, $event);
        if (!$gamer) {
            return;
        }

        $gamer->setPassed(true);
        $this->onGrowPhaseAction($event, $gamer);
    }

    /**
     * @param ChannelEvent $event
     */
    public function onGamerEndTurn($event)
    {
        $gamer = $this->checkGamerInPhase(Game::PHASE_FEED, $event);
        if (!$gamer) {
            return;
        }

        $this->game->nextActiveGamer();
        $event->addSubEvent('change-active-gamer', [
            'old' => $gamer->getId(),
            'new' => $this->game->getActiveGamer()->getId(),
        ]);
    }


    /*******************************************************************************************************************
     * PRIVATE
     ******************************************************************************************************************/

    /**
     * @param $phase
     * @param ChannelEvent $event
     * @return Gamer|null
     */
    private function checkGamerInPhase($phase, $event)
    {
        $data = $event->getData();

        if ($this->game->getActivePhase() != $phase) {
            $event->replaceEvent('error', [
                'message' => 'Wrong game phase',
            ]);
            return null;
        }

        $gamer = $this->game->getGamerById($data['gamer']);
        if (!$gamer) {
            $event->replaceEvent('error', [
                'message' => 'Gamer not found',
            ]);
            $event->setReceivers([$event->getInitiator()->getId()]);
            return null;
        }

        if ($gamer !== $this->game->getActiveGamer()) {
            $event->replaceEvent('error', [
                'message' => 'It is not your turn',
            ]);
            $event->setReceivers([$event->getInitiator()->getId()]);
            return null;
        }

        return $gamer;
    }

    /**
     * @param ChannelEvent $event
     * @param Gamer $gamer
     */
    private function onGrowPhaseAction($event, $gamer)
    {
        $event->setAsync(false);

        if ($gamer->getHandCartsCount() == 0) {
            $gamer->setPassed(true);
            $event->addSubEvent('gamer-pass', [
                'gamer' => $gamer->getId(),
            ]);
        }

        if ($this->game->checkGrowPhaseFinished()) {
            $this->game->prepareFeedPhase();
            $event->addSubEvent('start-feed-phase', [
                'activePhase' => $this->game->getActivePhase(),
                'turnSequence' => $this->game->getTurnSequence(),
                'foodCount' => $this->game->getFoodCount(),
            ]);
        } else {
            $this->game->nextActiveGamer();
            $event->addSubEvent('change-active-gamer', [
                'old' => $gamer->getId(),
                'new' => $this->game->getActiveGamer()->getId(),
            ]);
        }
    }

    /**
     * @param ChannelEvent $event
     * @param Gamer $gamer
     */
    private function onFeedPhaseAction($event, $gamer)
    {
        $event->setAsync(false);

        if (!$this->game->gamerAllowedToEat($gamer) && !$gamer->hasPotentialActivities()) {
            $gamer->setPassed(true);
            $event->addSubEvent('gamer-pass', [
                'gamer' => $gamer->getId(),
            ]);
        }

        if ($this->game->checkFeedPhaseFinished()) {

            $event->dump('NEED THE NEXT TURN');

            //TODO

//            $this->game->prepareFeedPhase();
//            $event->addSubEvent('start-feed-phase', [
//                'activePhase' => $this->game->getActivePhase(),
//                'turnSequence' => $this->game->getTurnSequence(),
//                'foodCount' => $this->game->getFoodCount(),
//            ]);
        } else {
            if (!$gamer->hasActivities()) {
                $this->game->nextActiveGamer();
            }
            
            $event->addSubEvent('change-active-gamer', [
                'old' => $gamer->getId(),
                'new' => $this->game->getActiveGamer()->getId(),
            ]);
        }
        
    }
}
