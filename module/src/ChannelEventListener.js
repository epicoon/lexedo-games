#lx:namespace lexedo.games;
class ChannelEventListener extends lx.socket.EventListener {
	constructor(env) {
		super();
		this._environment = env;
	}

	getEnvironment() {
		return this._environment;
	}

	getGame() {
		return this.getEnvironment().getGame();
	}

	onError(event) {
		lx.tostError(event.getData().message);
	}

	onNewGamer(event) {
		this.getEnvironment().onChangeGamersList(event.getData());
	}

	onGamerReconnected(event) {
		this.getEnvironment().onGamerReconnected(event.getData());
	}

	onObserverJoined(event) {
		this.getEnvironment().onObserverJoined(event.getData());
	}

	onSetGameReferences(event) {
		this.getEnvironment().onSetGameReferences(event.getData());
	}

	onGameStuffed(event) {
		this.getEnvironment().onGameStuffed(event.getData());
	}

	onGameBegin(event) {
		this.getEnvironment().onGameBegin(event.getData());
	}

	onGameLoaded(event) {
		this.getEnvironment().onGameLoaded(event.getData());
	}
}
