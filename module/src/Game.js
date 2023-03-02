/*
 * Game life cycle events:
 * - ENV_gameReferencesReceived
 * - ENV_gameConditionReceived
 * - ENV_gameBegin
 */
#lx:namespace lexedo.games;
class Game {
	constructor(env) {
		this._environment = env;
		this._plugin = env.getPlugin();
		this._pending = true;

		this.gamers = {};
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

	getGamers() {
		return this.gamers;
	}

	eachGamer(f) {
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
}
