<?php

namespace <<namespace>>;

use lexedo\games\AbstractGame;
use lexedo\games\AbstractGameCondition;
use lexedo\games\AbstractGamer;
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

    /**
     * @param <<ucslug>>GameCondition $condition
     */
    protected function setFromCondition(AbstractGameCondition $condition): void
    {
        //TODO
    }

    /**
     * @param null <<ucslug>>Gamer $gamer
     * @param null <<ucslug>>GameCondition $condition
     */
    protected function filterConditionForGamer(?AbstractGamer $gamer, AbstractGameCondition $condition): array
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

    /**
     * @param <<ucslug>>Gamer $gamer
     */
    protected function prepareGamer(AbstractGamer $gamer): void
    {
        //TODO
    }

    protected function getPrepareData(): iterable
    {
        //TODO
        return [];
    }

    /**
     * @param <<ucslug>>Gamer $gamer
     */
    protected function getGamerPrepareData(AbstractGamer $gamer): iterable
    {
        //TODO
        return [];
    }
}
