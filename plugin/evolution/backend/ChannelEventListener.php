<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\Gamer;
use lexedo\games\evolution\backend\game\Property;
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

        $propertyType = $data['property'];
        if (!$cart->hasProperty($propertyType)) {
            $event->replaceEvent('error', [
                'message' => 'Cart hasn\'t this property',
            ]);
            return;
        }

        $isFriendly = PropertyBank::isFriendly($propertyType);
        $creatures = $data['creatures'];
        foreach ($creatures as $creatureData) {
            if (
                ($isFriendly && $data['gamer'] != $creatureData['creatureGamer'])
                || (!$isFriendly && $data['gamer'] == $creatureData['creatureGamer'])
            ) {
                $event->replaceEvent('error', [
                    'message' => 'Creature owner is wrong',
                ]);
                return;
            }

            $creatureOwner = $this->game->getGamerById($creatureData['creatureGamer']);
            if (!$creatureOwner) {
                $event->replaceEvent('error', [
                    'message' => 'Creature owner not found',
                ]);
                return;
            }

            $creature = $creatureOwner->getCreatureById($creatureData['creature']);
            if (!$creature) {
                $event->replaceEvent('error', [
                    'message' => 'Creature not found',
                ]);
                return;
            }
        }

        if (count($creatures) == 1) {
            $creature = $creatureOwner->getCreatureById($creatures[0]['creature']);
            if (!$creature->canAttachProperty($propertyType)) {
                $event->replaceEvent('error', [
                    'message' => 'Creature can not attach this property',
                ]);
                return;
            }
        } elseif (count($creatures) == 2) {
            $creature0 = $creatureOwner->getCreatureById($creatures[0]['creature']);
            $creature1 = $creatureOwner->getCreatureById($creatures[1]['creature']);
            if ($creature0->hasRelation($creature1, $propertyType)) {
                $event->replaceEvent('error', [
                    'message' => 'This creatures are already attached by the same property',
                ]);
                return;
            }
        } else {
            $event->replaceEvent('error', [
                'message' => 'Creature can not attach this property',
            ]);
            return;
        }

        $properties = [];
        $creaturesData = [];
        foreach ($creatures as $creatureData) {
            $creature = $creatureOwner->getCreatureById($creatureData['creature']);
            $property = $creature->addProperty($propertyType);
            $creaturesData[] = [
                'creatureGamer' => $creature->getGamer()->getId(),
                'creature' => $creature->getId(),
                'property' => $property->getId(),
            ];
            $properties[] = $property;
        }

        if (count($properties) == 2) {
            $asymmData = Property::bindPareProperties($properties[0], $properties[1]);
            if ($asymmData === false) {
                $event->replaceEvent('error', [
                    'message' => 'Pare property is wrong',
                ]);
                return;
            }

            if ($asymmData) {
                $creaturesData[0]['asymm'] = $asymmData[0];
                $creaturesData[1]['asymm'] = $asymmData[1];
            }
        }

        $gamer->dropCart($cart);
        $event->addData([
            'creatures' => $creaturesData,
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

        if (!$gamer->isAvailableToFeedCreature()) {
            $event->replaceEvent('error', [
                'message' => 'You are not available to feed a creature',
            ]);
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

        if (!$creature->isHungry()) {
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

        if ($gamer->mustEat()) {
            $event->replaceEvent('error', [
                'message' => 'You have a hungry creature. You must feed it. !!!',
            ]);
            return;
        }

        $this->game->nextActiveGamer();
        $event->addSubEvent('change-active-gamer', [
            'old' => $gamer->getId(),
            'new' => $this->game->getActiveGamer()->getId(),
        ]);
    }

    /**
     * @param ChannelEvent $event
     */
    public function onPropertyAction($event)
    {
        $gamer = $this->checkGamerInPhase(Game::PHASE_FEED, $event);
        if (!$gamer) {
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

        $property = $creature->getPropertyById($data['property']);
        if (!$property) {
            $event->replaceEvent('error', [
                'message' => 'Property not found',
            ]);
            return;
        }

        if (!$property->isAvailable()) {
            $event->replaceEvent('error', [
                'message' => 'Property is unavailable',
            ]);
            return;
        }

        $result = $property->runAction($data['data'] ?? []);
        if ($result === false) {
            $event->replaceEvent('error', [
                'message' => 'Operation is unavailable',
            ]);
            return;
        }

        $event->addData([
            'result' => $result,
        ]);

        if (!$this->game->getAttakCore()->isOnHold()) {
            $this->onFeedPhaseAction($event, $gamer);
        }
    }

    /**
     * @param ChannelEvent $event
     */
    public function onApproveRevenge($event)
    {
        if ($this->game->isActive()) {
            $event->replaceEvent('error', [
                'message' => 'Game is active',
            ]);
            return;
        }

        $data = $event->getData();
        $result = $this->game->approveRevenge($data['gamer']);
        if (empty($result)) {
            $event->replaceEvent('error', [
                'message' => 'Problem while approving revenge',
            ]);
            return;
        }

        $event->addData(['report' => $result]);
        if ($result['start']) {
            $subEvent = $event->addSubEvent('game-begin');
            $this->game->fillNewPhaseEvent($subEvent);
        }
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

        
        $gamerOnHold = $this->game->getAttakCore()->getPendingGamer();
        if ($gamerOnHold) {
            if ($gamer === $gamerOnHold) {
                return $gamer;
            } else {
                $event->replaceEvent('error', [
                    'message' => 'We are waiting for attaked gamer decision',
                ]);
                $event->setReceivers([$event->getInitiator()->getId()]);
                return null;
            }
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
            $subEvent = $event->addSubEvent('start-feed-phase');
            $this->game->fillNewPhaseEvent($subEvent, Game::PHASE_FEED);
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

        if ($gamer->mustEat() || $gamer->hasActivities()) {
            return;
        }

        if (!$this->game->gamerAllowedToEat($gamer) && !$gamer->hasPotentialActivities()) {
            $gamer->setPassed(true);
            $event->addSubEvent('gamer-pass', [
                'gamer' => $gamer->getId(),
            ]);
        }

        if ($this->game->checkFeedPhaseFinished()) {
            $subEvent = $event->addSubEvent('finish-feed-phase');
            $subEvent->addData([
                'extinction' => $this->game->runExtinction(),
                'properties' => $this->game->restorePropertiesState(),
            ]);
            $this->game->fillNewPhaseEvent($subEvent, Game::PHASE_GROW);
            if ($this->game->isActive()) {
                $subEvent->addData([
                    'gameOver' => false,
                ]);
            } else {
                $subEvent->addData([
                    'gameOver' => true,
                    'results' => $this->game->calcScore(),
                ]);
            }
        } else {
            $this->game->nextActiveGamer();
            $event->addSubEvent('change-active-gamer', [
                'old' => $gamer->getId(),
                'new' => $this->game->getActiveGamer()->getId(),
            ]);
        }
    }
}
