<?php

namespace lexedo\games\actions;

class ActionGetSavedGames extends AbstractAction
{
    /**
     * @return array
     */
    public function run()
    {
        $data = $this->request->getData();
        $gameType = $data['gameType'];

        return [];
    }
}
