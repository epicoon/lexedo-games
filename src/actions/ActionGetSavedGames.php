<?php

namespace lexedo\games\actions;

use lexedo\games\models\GamerInGame;
use lx;

class ActionGetSavedGames extends AbstractAction
{
    /**
     * @return array
     */
    public function run()
    {
        $authField = $this->channel->getUserAuthFieldByConnection($this->request->getInitiator());

        $data = $this->request->getData();
        $gameType = $data['gameType'] ?? null;
        //TODO использовать фильтр по типу

        /** @var GamerInGame[] $gamerInGames */
        $gamerInGames = GamerInGame::find(['userAuthValue' => $authField]);
        $games = [];
        foreach ($gamerInGames as $gamerInGame) {
            $games[] = $gamerInGame->gameSave;
        }

        $gamerProvider = $this->channel->getGamesProvider();
        $result = [];
        foreach ($games as $game) {
            $data = [
                'type' => $game->gameType,
                'name' => $game->name,
                'date' => $game->date->format('Y-m-d h:i:s')
            ];

            $gamers = $game->gamers;
            $gamerNames = [];
            foreach ($gamers as $gamer) {
                $gamerNames[] = $gamer->userAuthValue;
            }

            $data['gamers'] = implode(', ', $gamerNames);
            $gameData = $gamerProvider->getGameData($game->gameType);
            $data['image'] = $gameData['image'];

            $result[] = $data;
        }

        return $result;
    }
}
