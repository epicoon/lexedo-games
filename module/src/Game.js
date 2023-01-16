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

	onStuffed() {
		// abstract
	}

	setGameReferences(references) {
		// abstract
	}

	actualizeAfterReconnect(data) {
		// abstract
	}

	onBegin(data) {
		// abstract
	}

	onChangeGamersList(list) {
		let gamerClass = self::getGamerClass();
		for (let i=0; i<list.len; i++) {
			let pare = list[i];
			let mate = this.getEnvironment().getSocket().getChannelMate(pare.connectionId);
			if (!(pare.gamerId in this.gamers))
				this.gamers[pare.gamerId] = new gamerClass(this, pare.gamerId, mate);
		}
	}

	onGamerReconnected(data) {
		let mate = this.getEnvironment().getSocket().getChannelMate(data.reconnectionData.newConnectionId);
		if (!mate.isLocal()) {
			for (let i in this.gamers) {
				let gamer = this.gamers[i];
				if (gamer._connectionId == data.reconnectionData.oldConnectionId)
					gamer.updateChannelMate(mate);
			}
			return;
		}

		this.onChangeGamersList(data.gamersData);
		this.actualizeAfterReconnect(data.gameData);
	}

	onObserverJoined(data) {
		this.onChangeGamersList(data.gamersData);
		this.actualizeAfterReconnect(data.gameData);
	}

	onLoaded(data) {
		this.actualizeAfterReconnect(data.gameData);
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
