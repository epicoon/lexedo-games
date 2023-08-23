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
class OnlineGame extends lexedo.games.LocalGame {
	constructor(env) {
		super(env);

		this._pending = true;
	}

	static getChannelEventListenerClass() {
		return lexedo.games.ChannelEventListener;
	}

	static getConnectionEventListenerClass() {
		return lexedo.games.ConnectionEventListener;
	}

	static getGamerClass() {
		return lexedo.games.OnlineGamer;
	}

	isLocal() {
		return false;
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

	getLocalGamer() {
		for (let id in this.gamers) {
			let gamer = this.gamers[id];
			if (gamer.isLocal()) return gamer;
		}
		return null;
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
