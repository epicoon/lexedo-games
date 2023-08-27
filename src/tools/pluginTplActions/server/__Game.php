<?php

namespace <<namespace>>;

use lexedo\games\AbstractGame;
use lx\socket\channel\ChannelEvent;

/**
 * @property-read <<ucslug>>Channel $channel
 * @property-read Plugin $plugin;
 *
 * @method <<ucslug>>Channel getChannel()
 * @method Plugin getPlugin()
 * @method GamersList&iterable<<<ucslug>>Gamer> getGamers()
 * @method <<ucslug>>Gamer|null getGamerById(string $id)
 * @method void registerGamer(<<ucslug>>Gamer $gamer)
 * @method <<ucslug>>GameCondition getConditionBlank()
 */
class <<ucslug>>Game extends AbstractGame
{
    public function getClassesMap(): array
    {
        return [
            self::GAMER_CLASS => <<ucslug>>Gamer::class,
            self::CONDITION_CLASS => <<ucslug>>GameCondition::class,
        ];
    }

    public function getCondition(): <<ucslug>>GameCondition
    {
        $condition = $this->getConditionBlank();

        //TODO

        return $condition;
    }

    protected function setFromCondition(<<ucslug>>GameCondition $condition): void
    {
        //TODO
    }

    protected function filterConditionForGamer(?<<ucslug>>Gamer $gamer, <<ucslug>>GameCondition $condition): array
    {
        //TODO

        return [];
    }

    public function init(): void
    {
        //TODO
    }

    public function reset(): void
    {
        //TODO
    }

    protected function prepare(): void
    {
        //TODO
    }

    protected function prepareGamer(<<ucslug>>Gamer $gamer): void
    {
        //TODO
    }

    protected function getPrepareData(): iterable
    {
        //TODO
        return [];
    }

    protected function getGamerPrepareData(<<ucslug>>Gamer $gamer): iterable
    {
        //TODO
        return [];
    }
}
