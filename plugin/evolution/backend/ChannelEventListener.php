<?php

namespace lexedo\games\evolution\backend;

use lx;
use lexedo\games\evolution\backend\game\Game;
use lexedo\games\evolution\backend\game\Gamer;
use lexedo\games\evolution\backend\game\Property;
use lexedo\games\evolution\backend\game\PropertyBank;
use lx\socket\Channel\ChannelEvent;
use lx\socket\Connection;

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
            $this->setError($event, 'error.CartNotFound');
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
            $this->setError($event, 'error.CartNotFound');
            return;
        }

        $propertyType = $data['property'];
        if (!$cart->hasProperty($propertyType)) {
            $this->setError($event, 'error.WrongPropertyForCart');
            return;
        }

        $isFriendly = PropertyBank::isFriendly($propertyType);
        $creatures = $data['creatures'];
        foreach ($creatures as $creatureData) {
            if (
                ($isFriendly && $data['gamer'] != $creatureData['creatureGamer'])
                || (!$isFriendly && $data['gamer'] == $creatureData['creatureGamer'])
            ) {
                $this->setError($event, 'error.WrongOwnerForCreature');
                return;
            }

            $creatureOwner = $this->game->getGamerById($creatureData['creatureGamer']);
            if (!$creatureOwner) {
                $this->setError($event, 'error.CreatureOwnerNotFound');
                return;
            }

            $creature = $creatureOwner->getCreatureById($creatureData['creature']);
            if (!$creature) {
                $this->setError($event, 'error.CreatureNotFound');
                return;
            }
        }

        if (count($creatures) == 1) {
            $creature = $creatureOwner->getCreatureById($creatures[0]['creature']);
            if (!$creature->canAttachProperty($propertyType)) {
                $this->setError($event, 'error.WrongPropertyForCreature');
                return;
            }
        } elseif (count($creatures) == 2) {
            $creature0 = $creatureOwner->getCreatureById($creatures[0]['creature']);
            $creature1 = $creatureOwner->getCreatureById($creatures[1]['creature']);
            if ($creature0->hasRelation($creature1, $propertyType)) {
                $this->setError($event, 'error.ParePropertyAlreadyExists');
                return;
            }
        } else {
            $this->setError($event, 'error.WrongPropertyForCreature');
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
                $this->setError($event, 'error.WrongPareProperty');
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
            $this->setError($event, 'error.NotAvailableToFeed');
            return;
        }

        if (!$this->game->getFoodCount()) {
            $this->setError($event, 'error.NoFood');
            return;
        }

        $data = $event->getData();
        $creature = $gamer->getCreatureById($data['creature']);
        if (!$creature) {
            $this->setError($event, 'error.CreatureNotFound');
            return;
        }

        if (!$creature->isHungry()) {
            $this->setError($event, 'error.CreatureNotHungry');
            return;
        }

        $feedReport = $this->game->feedCreature($creature);
        if (!$feedReport) {
            $this->setError($event, 'error.FeedProblem');
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
            $this->setError($event, 'tost.HaveToFeed');
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
            $this->setError($event, 'error.CreatureNotFound');
            return;
        }

        $property = $creature->getPropertyById($data['property']);
        if (!$property) {
            $this->setError($event, 'error.PropertyNotFound');
            return;
        }

        if (!$property->isAvailable()) {
            $this->setError($event, 'error.PropertyIsUnavailable');
            return;
        }

        $result = $property->runAction($data['data'] ?? []);
        if ($result === false) {
            $this->setError($event, 'error.OperationIsUnavailable');
            return;
        }
        
        $log = $result['log'] ?? null;
        if ($log) {
            unset($result['log']);
            $event->addData([
                'log' => $log,
            ]);
        }

        $event->addData([
            'result' => $result,
        ]);

        $this->localizeEvent($event);

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
            $this->setError($event, 'error.GameIsActive');
            return;
        }

        $data = $event->getData();
        $result = $this->game->approveRevenge($data['gamer']);
        if (empty($result)) {
            $this->setError($event, 'error.RevengeProblem');
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
            $this->setError($event, 'error.WrongGamePhase');
            return null;
        }

        $gamer = $this->game->getGamerById($data['gamer']);
        if (!$gamer) {
            $this->setError($event, 'error.GamerNotFound');
            return null;
        }

        
        $gamerOnHold = $this->game->getAttakCore()->getPendingGamer();
        if ($gamerOnHold) {
            if ($gamer === $gamerOnHold) {
                return $gamer;
            } else {
                $this->setError($event, 'error.WaitingForAttaked');
                return null;
            }
        }
        
        if ($gamer !== $this->game->getActiveGamer()) {
            $this->setError($event, 'error.NotYourTurn');
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

    /**
     * @param ChannelEvent $event
     * @param string $message
     */
    private function setError($event, $message)
    {
        $event->replaceEvent('error', [
            'message' => $message,
        ]);
        $event->setReceivers($event->getInitiator());

        $this->localizeEvent($event);
    }

    /**
     * @param ChannelEvent $event
     */
    private function localizeEvent($event)
    {
        $data = $event->getData();
        $log = $data['log'] ?? null;
        unset($data['log']);
        $message = $data['message'] ?? null;
        unset($data['message']);
        $event->setData($data);

        $recievers = $event->getReceivers();
        /** @var Connection $reciever */
        foreach ($recievers as $reciever) {
            $id = $this->game->getChannel()->getConnectionCommonId($reciever);
            $cookie = lx::$app->getCommonChannel()->getUserCookie($id);
            $lang = $cookie['lang'] ?? 'en-EN';

            if ($message) {
                $tMessage = $this->game->t($message, $lang);
                $event->addDataForConnection($reciever->getId(), 'message', $tMessage);
            }

            if ($log) {
                $tLog = [];
                foreach ($log as $key) {
                    $tLog[] = $this->game->t($key, $lang);
                }
                $data['log'] = $tLog;
                $event->addDataForConnection($reciever->getId(), 'log', $tMessage);
            }
        }
    }
}
