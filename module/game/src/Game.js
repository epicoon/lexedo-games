/*
 * Game life cycle events:
 * - ENV_gameReferencesReceived
 * - ENV_gameConditionReceived
 * - ENV_gameCreated
 * - ENV_socketConnected
 * - ENV_changeGamersList
 * - ENV_localGamerConnected
 * - ENV_gamerReconnected
 * - ENV_observerConnected
 * - ENV_gameStuffed
 * - ENV_gameBegin
 */
#lx:namespace lexedo.games;
class Game extends lx.Object {
	constructor(env) {
		super();

		this._environment = env;
		this._plugin = env.getPlugin();
		this._pending = true;
		this.gamers = {};

		if (lexedo.games.actions) {
			let actionsClass = this.constructor.lxHasMethod('getActionsClass')
				? this.constructor.getActionsClass()
				: lexedo.games.actions.Actions;
			this.actions = new actionsClass(this);
		}

		this.init();
	}

	static getGamerClass() {
		return lexedo.games.Gamer;
	}

	static getChannelEventListenerClass() {
		return lexedo.games.ChannelEventListener;
	}

	static getConnectionEventListenerClass() {
		return lexedo.games.ConnectionEventListener;
	}

	init() {
		// abstract		
	}

	getPlugin() {
		return this._plugin;
	}

	getCore() {
		return this._plugin.core;
	}

	getEnvironment() {
		return this._environment;
	}

	isPending() {
		return this._pending;
	}

	setPending(value) {
		this._pending = value;
	}

	registerGamer(channelMate, gamerId) {
		if (gamerId in this.gamers) return;
		let gamerClass = self::getGamerClass();
		const gamer = new gamerClass(this, gamerId, channelMate);
		this.gamers[gamerId] = gamer;
		if (gamer.isLocal())
			this.getPlugin().trigger('ENV_localGamerConnected');
	}
	
	getGamers() {
		return this.gamers;
	}

	getGamersCount() {
		let counter = 0;
		for (let i in this.gamers) counter++;
		return counter;
	}

	forEachGamer(f) {
		for (let id in this.gamers)
			f(this.gamers[id]);
	}

	getLocalGamer() {
		for (let id in this.gamers) {
			let gamer = this.gamers[id];
			if (gamer.isLocal()) return gamer;
		}
		return null;
	}

	getGamerById(id) {
		return this.gamers[id];
	}

	getGamerByChannelMate(mate) {
		for (let id in this.gamers) {
			let gamer = this.gamers[id];
			if (gamer._connectionId == mate.getId()) return gamer;
		}
		return null;		
	}

	getChannelMateByGamer(gamer) {
		return this.getEnvironment().socket.getChannelMate(gamer.getChannelMateId());
	}
}
