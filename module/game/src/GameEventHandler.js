#lx:namespace lexedo.games;
class GameEventHandler {
    constructor(env, game) {
        this._env = env;
        this._game = game;
        __subscribeEvents(this);
    }

    getPlugin() {
        return this._env.getPlugin();
    }

    getEnvironment() {
        return this._env;
    }

    getGame() {
        return this._game;
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __subscribeEvents(self) {
    const plugin = self.getPlugin();
    plugin.on('ENV_changeGamersList', event=>__onChangeGamersList(self, event.getData()));
    plugin.on('ENV_gamerReconnected', event=>__onGamerReconnected(self, event.getData()));
    plugin.on('ENV_observerConnected', event=>__onObserverJoined(self, event.getData()));
}

function __onChangeGamersList(self, list) {
    const game = self.getGame();
    for (let i=0; i<list.len; i++) {
        let pare = list[i];
        let mate = self.getEnvironment().getSocket().getChannelMate(pare.connectionId);
        game.registerGamer(mate, pare.gamerId);
    }
}

function __onGamerReconnected(self, data) {
    let mate = self.getEnvironment().getSocket().getChannelMate(data.reconnectionData.newConnectionId);
    if (!mate.isLocal()) {
        const game = self.getGame();
        for (let i in game.gamers) {
            let gamer = game.gamers[i];
            if (gamer._connectionId == data.reconnectionData.oldConnectionId)
                gamer.updateChannelMate(mate);
        }
        return;
    }

    self.getPlugin().trigger('ENV_changeGamersList', data.gamersData);
    self.getPlugin().trigger('ENV_gameConditionReceived', data.gameData);
}

function __onObserverJoined(self, data) {
    self.getPlugin().trigger('ENV_changeGamersList', data.gamersData);
    self.getPlugin().trigger('ENV_gameConditionReceived', data.gameData);
}
