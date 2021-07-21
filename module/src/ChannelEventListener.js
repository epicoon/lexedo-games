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

	onNewGamer(event) {
		var data = event.getData();
		this.getEnvironment().onChangeGamersList(data);
	}

	onGameStuffed(event) {
		var data = event.getData();
		this.getEnvironment().onGameStuffed();
	}

	onGameBegin(event) {
		var data = event.getData();
		this.getEnvironment().onGameBegin(data);
	}

	onGamerReconnected(event) {
		var data = event.getData();
		this.getEnvironment().onGamerReconnected(data);
	}
}
