class ChannelEventListener extends lx.socket.EventListener #lx:namespace lexedo.games {
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

	onGamerReconnected(event) {
		var data = event.getData();
		this._environment.onGamerReconnected(data);
		console.log(event);
		console.log(event._socket);
	}
}
