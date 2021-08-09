<?php

namespace lexedo\games\evolution\backend\game;

use lx;
use lexedo\games\AbstractGameCondition;

/**
 * @method $this setCartPack(array $data)
 * @method $this setTurnSequence(array $sequence)
 * @method $this setActiveGamer(string $gamerId)
 * @method $this setLastTurn(bool $value)
 * @method $this setActivePhase(string $phase)
 * @method $this setFoodCount(int $foodCount)
 * @method $this setCreatures(array $creatures)
 * @method $this setProperties(array $properties)
 * @method $this setAttakState(array $data)
 */
class GameCondition extends AbstractGameCondition
{
    protected ?array $cartPack = null;
    protected array $turnSequence;
    protected string $activeGamer;
    protected bool $isLastTurn;
    protected string $activePhase;
    protected int $foodCount;
    protected array $creatures;
    protected array $properties;
    protected array $attakState;

    protected function getFields(): array
    {
        return array_merge(parent::getFields(), [
            'cartPack',
            'turnSequence',
            'activeGamer',
            'isLastTurn',
            'activePhase',
            'foodCount',
            'creatures',
            'properties',
            'attakState',
        ]);
    }

    /**
     * @param array<Gamer> $gamers
     */
    public function setGamers(array $gamers): GameCondition
    {
        /** @var lx\UserManagerInterface $userManager */
        $userManager = lx::$app->userManager;
        $map = [];
        foreach ($gamers as $gamer) {
            $data = $gamer->toArray();
            $data['authField'] = $userManager->getAuthField($gamer->getUser());
            $map[$gamer->getId()] = $data;
        }

        $this->gamers = $map;
        return $this;
    }
}
