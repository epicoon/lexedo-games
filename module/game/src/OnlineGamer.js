#lx:namespace lexedo.games;
class OnlineGamer extends lx.Object {
	constructor(game, id, channelMate, data = {}) {
		super();

		this._game = game;
		this._id = id;
		this._connectionId = channelMate.getId();
		this._name = channelMate.login;
		this._isLocal = channelMate.isLocal();

		this.init(data);
	}

	init(data) {
		// pass
	}

	updateChannelMate(channelMate) {
		this._connectionId = channelMate.getId();
		this._name = channelMate.login;
		this._isLocal = channelMate.isLocal();
	}

	getEnvironment() {
		return this._game.getEnvironment();
	}

	getGame() {
		return this._game;
	}
	
	getId() {
		return this._id;
	}

	getChannelMate() {
		return this.getEnvironment().getSocket().getChannelMate(this._connectionId);
	}

	getChannelMateId() {
		return this._connectionId;
	}

	getName() {
		return this._name;
	}

	isLocal() {
		return this._isLocal;
	}
}
