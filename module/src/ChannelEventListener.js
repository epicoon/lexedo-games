class ChannelEventListener #lx:namespace lexedo.games extends lx.socket.EventListener {
	constructor(env) {
		super();
		this._environment = env;
	}

	getEnvironment() {
		return this._environment;
	}

	onError(event) {
		lx.Tost.error(event.getData().message);
	}

	onGameStuffed(event) {
		var data = event.getData();
		this._environment.onGameStuffed();
	}

	onGameBegin(event) {
		var data = event.getData();
		this._environment.onGameBegin(data);
	}
}
