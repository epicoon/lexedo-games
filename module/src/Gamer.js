class Gamer extends lx.BindableModel #lx:namespace lexedo.games {
	constructor(game, id, channelMate) {
		super();

		this._game = game;
		this._id = id;
		this._connectionId = channelMate.getId();
		this._name = channelMate.login;
		this._isLocal = channelMate.isLocal();
	}

	updateChannelMate(channelMate) {
		this._connectionId = channelMate.getId();
		this._name = channelMate.login;
		this._isLocal = channelMate.isLocal();
	}

	getEnvironment() {
		return this._game.getEnvironment();
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
