<?php

namespace lexedo\games\evolution\backend\game;

use lexedo\games\AbstractGame;
use lx;
use lexedo\games\evolution\backend\I18nHelper;
use lexedo\games\evolution\backend\EvolutionChannel;
use lexedo\games\evolution\Plugin;
use lx\Math;
use Exception;
use lx\socket\Channel\ChannelEvent;
use lx\socket\Connection;

/**
 * @property EvolutionChannel $channel
 * @property array<Gamer> $gamers
 * @property Plugin $plugin;
 *
 * @method EvolutionChannel getChannel()
 * @method Plugin getPlugin()
 * @method Gamer[] getGamers()
 * @method Gamer|null getGamerById(string $id)
 * @method registerGamer(Gamer $gamer)
 */
class Game extends AbstractGame
{
    const RECONNECTION_STATUS_PENDING = 'pending';
    const RECONNECTION_STATUS_ACTIVE = 'active';
    const RECONNECTION_STATUS_REVENGE = 'revenge';

    const PHASE_GROW = 'grow';
    const PHASE_FEED = 'feed';

    const FOOD_TYPE_RED = 'red_food';
    const FOOD_TYPE_BLUE = 'blue_food';
    const FOOD_TYPE_FAT = 'fat_food';

    private array $log;
    private ?CartPack $cartPack;
    private array $turnSequence;
    private int $activeGamerIndex;
    private string $activePhase;
    private AttakCore $attakCore;
    private int $foodCount;
    private bool $isLastTurn;

    public function __construct(EvolutionChannel $channel)
    {
        parent::__construct($channel);

        $this->log = [];
        $this->turnSequence = [];
        $this->attakCore = new AttakCore($this);
        $this->cartPack = null;

        $this->foodCount = 0;
        $this->isLastTurn = false;

        $this->plugin = lx::$app->getPlugin('lexedo/games:evolution');
    }

    public function log(string $msgKey, array $params = []): void
    {
        $event = $this->prepareLogEvent($msgKey, $params);
        $this->getChannel()->sendEvent($event);
    }

    public function prepareLogEvent(
        string $msgKey,
        array $params = [],
        ?ChannelEvent $parentEvent = null
    ): ChannelEvent
    {
        $this->log[] = [
            'key' => $msgKey,
            'params' => $params,
        ];

        $event = $parentEvent
            ? $parentEvent->addSubEvent('log', ['log' => [$msgKey, $params]])
            : $this->getChannel()->createEvent('log', ['log' => [$msgKey, $params]]);
        I18nHelper::localizeEvent($event);

        return $event;
    }

    public function isLastTurn(): bool
    {
        return $this->isLastTurn;
    }

    public function getAttakCore(): AttakCore
    {
        return $this->attakCore;
    }

    public function onCreatureSuccessfullAttak(Creature $carnival): ?array
    {
        $carnivalCore = new CarnivalCore($this);
        return $carnivalCore->onAttak($carnival);
    }

    public function fillEventBeginGame(ChannelEvent $event): void
    {
        $this->fillNewPhaseEvent($event);
        $this->prepareLogEvent('logMsg.begin', [], $event);
    }

    public function fillEventGameDataForGamer(ChannelEvent $event, Connection $gamerConnection): void
    {
        if ($this->isPending()) {
            $event->setDataForConnection($gamerConnection, ['type' => self::RECONNECTION_STATUS_PENDING]);
            return;
        }

        if ($this->isWaitingForRevenge) {
            $event->setDataForConnection($gamerConnection, [
                'type' => self::RECONNECTION_STATUS_REVENGE,
                'approvesCount' => count($this->revengeApprovements),
                'gamersCount' => $this->getGamersCount(),
            ]);
            return;
        }

        $data = ['type' => self::RECONNECTION_STATUS_ACTIVE];

        //TODO active
        // карты игрока
        // стадия, данные стадии
        // активный игрок, порядок ходов
        // существа, свойства и их статусы
        // активированное и зависшее свойство
        // лог, чат?

        $event->setDataForConnection($gamerConnection, $data);
    }

    public function fillNewPhaseEvent(ChannelEvent $event, string $phase = self::PHASE_GROW): void
    {
        if ($this->isActive && $this->isLastTurn && $phase == self::PHASE_GROW) {
            $this->isActive = false;
            $this->isWaitingForRevenge = true;
            $this->revengeApprovements = [];
            return;
        }

        $this->activePhase = $phase;

        $firstTurn = false;
        if (!$this->isActive) {
            $this->prepare();
            $firstTurn = true;
        } else {
            $this->updateGamersSequence($this->isPhaseGrow());
            foreach ($this->gamers as $gamer) {
                $gamer->setPassed(false);
            }
        }

        $event->addData([
            'activePhase' => $this->getActivePhase(),
            'turnSequence' => $this->getTurnSequence(),
        ]);

        if ($this->isPhaseGrow()) {
            if (!$firstTurn) {
                $this->log('logMsg.growBegin');
            }

            $this->foodCount = 0;
            $newCarts = $this->distributeCarts();

            $this->isLastTurn = $this->cartPack->isEmpty();
            if ($this->isLastTurn) {
                $this->log('logMsg.lastTurn');
            }

            $event->addData([
                'isLastTurn' => $this->isLastTurn,
            ]);

            foreach ($this->gamers as $id => $gamer) {
                $cartsData = [];
                /** @var Cart $cart */
                foreach ($newCarts[$id] as $cart) {
                    $cartsData[] = $cart->toArray();
                }

                $event->setDataForConnection($gamer->getConnection(), [
                    'carts' => $cartsData,
                ]);
            }
        } elseif ($this->isPhaseFeed()) {
            $this->foodCount = Math::rand(3, 8);

            $this->log('logMsg.feedBegin', [
                'food' => $this->foodCount,
            ]);

            $event->addData([
                'foodCount' => $this->getFoodCount(),
            ]);
        }
    }

    public function prepare(): void
    {
        $this->prepareCartPack();
        $this->prepareGamers();

        $this->activePhase = self::PHASE_GROW;
        $this->foodCount = 0;
        $this->isLastTurn = false;
        $this->isWaitingForRevenge = false;
        $this->revengeApprovements = [];
        $this->isActive = true;
    }

    public function getTurnSequence(): array
    {
        return $this->turnSequence;
    }

    public function getActivePhase(): string
    {
        return $this->activePhase;
    }

    public function isPhaseGrow(): bool
    {
        return $this->activePhase == self::PHASE_GROW;
    }

    public function isPhaseFeed(): bool
    {
        return $this->activePhase == self::PHASE_FEED;
    }

    public function getActiveGamer(): Gamer
    {
        return $this->getGamerByIndex($this->activeGamerIndex);
    }

    public function getGamerIndex(Gamer $gamer): int
    {
        return array_search($gamer->getId(), $this->turnSequence);
    }

    public function getGamerByIndex(int $index): Gamer
    {
        return $this->gamers[$this->turnSequence[$index]];
    }

    public function nextActiveGamer(): void
    {
        $current = $this->activeGamerIndex;

        $this->incActiveGamerIndex();
        while ($this->getActiveGamer()->isPassed()) {
            $this->incActiveGamerIndex();
            if ($this->activeGamerIndex == $current) {
                break;
            }
        }
        
        if ($this->isPhaseFeed()) {
            $this->getActiveGamer()->prepareToFeedTurn();
        }
    }

    public function checkGrowPhaseFinished(): bool
    {
        foreach ($this->gamers as $gamer) {
            if (!$gamer->isPassed()) {
                return false;
            }
        }

        return true;
    }

    public function checkFeedPhaseFinished(): bool
    {
        foreach ($this->gamers as $gamer) {
            if ($this->gamerAllowedToEat($gamer) || $gamer->hasPotentialActivities()) {
                return false;
            }
        }

        return true;
    }

    public function gamerAllowedToEat(Gamer $gamer): bool
    {
        if ($this->getFoodCount() == 0) {
            return false;
        }

        return $gamer->hasHungryCreature();
    }

    public function getFoodCount(): int
    {
        return $this->foodCount;
    }

    public function wasteFood(): void
    {
        if ($this->foodCount > 0) {
            $this->foodCount--;
        }
    }

    public function feedCreature(Creature $creature): ?array
    {
        if ($this->getFoodCount() == 0) {
            return [];
        }

        $creature->getGamer()->onCreatureEaten();
        $feedReport = $creature->eat(self::FOOD_TYPE_RED);

        $this->log('logMsg.feed', [
            'name' => $creature->getGamer()->getUser()->login,
        ]);

        return $feedReport;
    }

    public function hasHungryCreature(): bool
    {
        foreach ($this->gamers as $gamer) {
            if ($gamer->hasHungryCreature()) {
                return true;
            }
        }

        return false;
    }

    public function runExtinction(): array
    {
        $report = [];
        foreach ($this->gamers as $gamer) {
            $gamerReport = $gamer->runExtinction();

            $this->log('logMsg.extinction', [
                'name' => $gamer->getUser()->login,
                'deadCreatures' => count($gamerReport['creatures']),
                'droppedCarts' => $gamerReport['dropping'],
            ]);

            $report[$gamer->getId()] = $gamerReport;
        }

        return $report;
    }

    public function restorePropertiesState(): array
    {
        $result = [];
        foreach ($this->gamers as $gamer) {
            $report = $gamer->restorePropertiesState();
            if (!empty($report)) {
                $result[$gamer->getId()] = $report;
            }
        }
        return $result;
    }

    public function calcScore(): array
    {
        $list = [];
        foreach ($this->gamers as $gamer) {
            $score = $gamer->calcScore();
            if (!array_key_exists($score, $list)) {
                $list[$score] = [];
            }
            $list[$score][] = [
                'gamerId' => $gamer->getId(),
                'dropping' => $gamer->getDropping(),
            ];
        }

        ksort($list);
        $list = array_reverse($list, true);
        foreach ($list as &$item) {
            usort($item, function ($a, $b) {
                if ($a['dropping'] > $b['dropping']) return -1;
                if ($a['dropping'] < $b['dropping']) return 1;
                return 0;
            });
        }
        unset($item);

        $result = [];
        foreach ($list as $score => $inScore) {
            foreach ($inScore as $data) {
                $result[] = [
                    'gamer' => $data['gamerId'],
                    'score' => $score,
                    'dropping' => $data['dropping'],
                ];
            }
        }
        return $result;
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * PRIVATE
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private function prepareCartPack(): void
    {
        if (is_null($this->cartPack)) {
            $this->cartPack = new CartPack();
        }

        $this->cartPack->reset();
    }

    private function prepareGamers(): void
    {
        if (empty($this->gamers)) {
            $connections = $this->getChannel()->getConnections();
            foreach ($connections as $connection) {
                $gamer = new Gamer($this, $connection);
                $this->registerGamer($gamer);
            }
        } else {
            $this->turnSequence = [];
            foreach ($this->gamers as $gamer) {
                $gamer->reset();
            }
        }

        $this->updateGamersSequence();
    }

    /**
     * @throws Exception
     */
    private function updateGamersSequence(bool $shift = false): void
    {
        if (empty($this->turnSequence)) {
            $this->turnSequence = Math::shuffleArray(array_keys($this->gamers));
        } elseif ($shift) {
            $gamerId = array_shift($this->turnSequence);
            $this->turnSequence[] = $gamerId;
        }

        $this->activeGamerIndex = 0;
        if ($this->isPhaseFeed()) {
            $this->getActiveGamer()->prepareToFeedTurn();
        }
    }

    private function distributeCarts(): array
    {
        $counters = [];
        $carts = [];
        foreach ($this->gamers as $gamerId => $gamer) {
            $counters[$gamerId] = $gamer->isEmpty() ? Constants::START_CARTS_COUNT : $gamer->getCreaturesCount() + 1;
            $carts[$gamerId] = [];
        }

        while (!empty($counters)) {
            if ($this->cartPack->isEmpty()) {
                break;
            }

            foreach ($this->gamers as $gamerId => $gamer) {
                if (!array_key_exists($gamerId, $counters)) {
                    continue;
                }

                $cart = $this->cartPack->handOverOne();
                $gamer->receiveCart($cart);
                $carts[$gamerId][] = $cart;
                $counters[$gamerId]--;
                if ($counters[$gamerId] == 0) {
                    unset($counters[$gamerId]);
                }

                if ($this->cartPack->isEmpty()) {
                    break;
                }
            }
        }

        return $carts;
    }

    private function incActiveGamerIndex(): void
    {
        $this->activeGamerIndex++;
        if ($this->activeGamerIndex == count($this->gamers)) {
            $this->activeGamerIndex = 0;
        }
    }
}
