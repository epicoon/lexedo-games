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
    plugin.on('ENV_proxy_gameStuffed', event=>__onGameStuffed(self, event.getData()));
    plugin.on('ENV_proxy_changeGamersList', event=>__onChangeGamersList(self, event.getData()));
    plugin.on('ENV_proxy_gamerReconnected', event=>__onGamerReconnected(self, event.getData()));
    plugin.on('ENV_proxy_observerConnected', event=>__onObserverConnected(self, event.getData()));
}

/**
 * @private
 * @param self {lexedo.gamers.GameEventHandler}
 * @param data {Object}
 *
 * @trigger ENV_gameStuffed
 */
function __onGameStuffed(self, data) {
    const env = self.getEnvironment();
    env.unlockScreen();
    env.game.setPending(false);
    self.getPlugin().trigger('ENV_gameStuffed');
}

/**
 * @private
 * @param self {lexedo.gamers.GameEventHandler}
 * @param list {Object}
 *
 * @trigger ENV_changeGamersList
 */
function __onChangeGamersList(self, list) {
    const game = self.getGame();
    for (let i=0; i<list.len; i++) {
        let pare = list[i];
        let mate = self.getEnvironment().getSocket().getChannelMate(pare.connectionId);
        game.registerGamer(mate, pare.gamerId);
    }
    self.getPlugin().trigger('ENV_changeGamersList');
}

/**
 * @private
 * @param self {lexedo.gamers.GameEventHandler}
 * @param data {Object: {
 *     reconnectionData {Object},
 *     gameData {Object},
 *     gamersData {Object}
 * }}
 *
 * @trigger-local ENV_changeGamersList
 * @trigger-local ENV_gamerReconnected
 * @trigger-local ENV_gameConditionReceived
 */
function __onGamerReconnected(self, data) {
    const env = self.getEnvironment(),
        mate = env.getSocket().getChannelMate(data.reconnectionData.newConnectionId);
    if (!mate.isLocal()) {
        const game = self.getGame();
        for (let i in game.gamers) {
            let gamer = game.gamers[i];
            if (gamer._connectionId == data.reconnectionData.oldConnectionId)
                gamer.updateChannelMate(mate);
        }
        return;
    }

    env.game.setPending(data.reconnectionData.gameIsPending);
    if (!env.game.isPending())
        env.unlockScreen();

    __onChangeGamersList(self, data.gamersData);
    self.getPlugin().trigger('ENV_gamerReconnected', data.gameData);
    self.getPlugin().trigger('ENV_gameConditionReceived', data.gameData);
}

/**
 * @private
 * @param self {lexedo.gamers.GameEventHandler}
 * @param data {Object: {
 *     observerId {String},
 *     gamersData {Object},
 *     gameData {Object},
 *     gameIsPending {Boolean}
 * }}
 *
 * @trigger-local ENV_changeGamersList
 * @trigger-local ENV_gameConditionReceived
 * @trigger ENV_observerConnected
 */
function __onObserverConnected(self, data) {
    const env = self.getEnvironment(),
        mate = env.getSocket().getChannelMate(data.observerId);
    if (mate.isLocal()) {
        env.game.setPending(data.gameIsPending);
        if (!env.game.isPending())
            env.unlockScreen();

        __onChangeGamersList(self, data.gamersData);
        self.getPlugin().trigger('ENV_gameConditionReceived', data.gameData);
    }

    self.getPlugin().trigger('ENV_observerConnected', data.gameData);
}
