#lx:namespace lexedo.games;
class Gamer extends lx.BindableModel {
	constructor(game, id, channelMate, data = {}) {
		super();

		this._game = game;
		this._id = id;
		this._connectionId = channelMate.getId();
		this._name = channelMate.login;
		this._isLocal = channelMate.isLocal();

		this.construct(data);
	}

	construct(data) {
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

	getName() {
		return this._name;
	}

	isLocal() {
		return this._isLocal;
	}
}
