<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\GamesServer;
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
 *
 * @method EvolutionChannel getChannel()
 */
class ChannelEventListener extends \lx\socket\Channel\ChannelEventListener
{
    /**
     * @return Game
     */
    public function getGame()
    {
        return $this->getChannel()->getGame();
    }

    public function getAvailableEventNames(): array
    {
        return ['chat-message'];
    }


    /*******************************************************************************************************************
     * EVENT HANDLERS
     ******************************************************************************************************************/

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
        
        $this->getGame()->log('logMsg.newCreature', ['name' => $gamer->getUser()->login]);

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

            $creatureOwner = $this->getGame()->getGamerById($creatureData['creatureGamer']);
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
            if ($asymmData === null) {
                $this->setError($event, 'error.WrongPareProperty');
                return;
            }

            if (!empty($asymmData)) {
                $creaturesData[0]['asymm'] = $asymmData[0];
                $creaturesData[1]['asymm'] = $asymmData[1];
            }
        }

        $gamer->dropCart($cart);
        $event->addData([
            'creatures' => $creaturesData,
        ]);

        $this->getGame()->log('logMsg.newProperty', [
            'name' => $gamer->getUser()->login,
            'property' => $properties[0]->getName(),
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

        if (!$this->getGame()->getFoodCount()) {
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

        $feedReport = $this->getGame()->feedCreature($creature);
        if (!$feedReport) {
            $this->setError($event, 'error.FeedProblem');
            return;
        }

        $event->addData([
            'currentFood' => $this->getGame()->getFoodCount(),
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

        $this->getGame()->nextActiveGamer();
        $event->addSubEvent('change-active-gamer', [
            'old' => $gamer->getId(),
            'new' => $this->getGame()->getActiveGamer()->getId(),
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

        I18nHelper::localizeEvent($event);

        if (!$this->getGame()->getAttakCore()->isOnHold()) {
            $this->onFeedPhaseAction($event, $gamer);
        }
    }

    /**
     * @param ChannelEvent $event
     */
    public function onApproveRevenge($event)
    {
        if ($this->getGame()->isActive()) {
            $this->setError($event, 'error.GameIsActive');
            return;
        }

        $data = $event->getData();
        $result = $this->getGame()->approveRevenge($data['gamer']);
        if (empty($result)) {
            $this->setError($event, 'error.RevengeProblem');
            return;
        }

        $event->addData(['report' => $result]);
        if ($result['start']) {
            $subEvent = $event->addSubEvent('game-begin');
            $this->getGame()->fillNewPhaseEvent($subEvent);
        }
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * PRIVATE
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * @param $phase
     * @param ChannelEvent $event
     * @return Gamer|null
     */
    private function checkGamerInPhase($phase, $event)
    {
        $data = $event->getData();

        if ($this->getGame()->getActivePhase() != $phase) {
            $this->setError($event, 'error.WrongGamePhase');
            return null;
        }

        $gamer = $this->getGame()->getGamerById($data['gamer']);
        if (!$gamer) {
            $this->setError($event, 'error.GamerNotFound');
            return null;
        }

        $gamerOnHold = $this->getGame()->getAttakCore()->getPendingGamer();
        if ($gamerOnHold) {
            if ($gamer === $gamerOnHold) {
                return $gamer;
            } else {
                $this->setError($event, 'error.WaitingForAttaked');
                return null;
            }
        }
        
        if ($gamer !== $this->getGame()->getActiveGamer()) {
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

        if ($this->getGame()->checkGrowPhaseFinished()) {
            $subEvent = $event->addSubEvent('start-feed-phase');
            $this->getGame()->fillNewPhaseEvent($subEvent, Game::PHASE_FEED);
        } else {
            $this->getGame()->nextActiveGamer();
            $event->addSubEvent('change-active-gamer', [
                'old' => $gamer->getId(),
                'new' => $this->getGame()->getActiveGamer()->getId(),
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

        if (!$this->getGame()->gamerAllowedToEat($gamer) && !$gamer->hasPotentialActivities()) {
            $gamer->setPassed(true);
            $event->addSubEvent('gamer-pass', [
                'gamer' => $gamer->getId(),
            ]);
        }

        if ($this->getGame()->checkFeedPhaseFinished()) {
            $this->getGame()->log('logMsg.feedEnd');

            $subEvent = $event->addSubEvent('finish-feed-phase');
            $subEvent->addData([
                'extinction' => $this->getGame()->runExtinction(),
                'properties' => $this->getGame()->restorePropertiesState(),
            ]);
            $this->getGame()->fillNewPhaseEvent($subEvent, Game::PHASE_GROW);
            if ($this->getGame()->isActive()) {
                $subEvent->addData([
                    'gameOver' => false,
                ]);
            } else {
                $subEvent->addData([
                    'gameOver' => true,
                    'results' => $this->getGame()->calcScore(),
                ]);
            }
        } else {
            $this->getGame()->nextActiveGamer();
            $event->addSubEvent('change-active-gamer', [
                'old' => $gamer->getId(),
                'new' => $this->getGame()->getActiveGamer()->getId(),
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

        I18nHelper::localizeEvent($event);
    }
}
