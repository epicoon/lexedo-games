<?php

namespace lexedo\games\cofb\backend;

use lexedo\games\AbstractGame;
use lexedo\games\AbstractGameCondition;
use lexedo\games\AbstractGamer;
use lx\socket\Channel\ChannelEvent;
use lx\socket\Connection;
use lexedo\games\cofb\Plugin;

/**
 * @property CofbChannel $channel
 * @property Plugin $plugin;
 *
 * @method CofbChannel getChannel()
 * @method Plugin getPlugin()
 * @method CofbGamer[] getGamers()
 * @method CofbGamer|null getGamerById(string $id)
 * @method registerGamer(CofbGamer $gamer)
 * @method CofbGameCondition getBasicCondition()
 */
class CofbGame extends AbstractGame
{
    public function getClassesMap(): array
    {
        return [
            self::GAMER_CLASS => CofbGamer::class,
            self::CONDITION_CLASS => CofbGameCondition::class,
        ];
    }

    public function getCondition(): CofbGameCondition
    {
        $condition = $this->getBasicCondition();

        //TODO

        return $condition;
    }

    /**
     * @param CofbGameCondition $condition
     */
    public function setCondition(AbstractGameCondition $condition): void
    {
        parent::setCondition($condition);
        
        //TODO
    }

    public function fillEventBeginGame(ChannelEvent $event): void
    {
        //TODO
    }

    public function getGameDataForGamer(?AbstractGamer $gamer = null): array
    {
        //TODO
    }
}
