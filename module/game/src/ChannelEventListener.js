#lx:namespace lexedo.games;
class ChannelEventListener extends lx.socket.EventListener {
	constructor(env) {
		super();
		this._environment = env;
		this._plugin = env.getPlugin();
	}

	getPlugin() {
		return this._plugin;
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
		this.getPlugin().trigger('ENV_changeGamersList', event.getData());
	}

	onGamerReconnected(event) {
		this.getPlugin().trigger('ENV_gamerReconnected', event.getData());
	}

	onObserverJoined(event) {
		this.getPlugin().trigger('ENV_observerConnected', event.getData());
	}

	onSetGameReferences(event) {
		this.getPlugin().trigger('ENV_gameReferencesReceived', event.getData());
	}

	onGameStuffed(event) {
		this.getPlugin().trigger('ENV_gameStuffed', event.getData());
	}

	onGameBegin(event) {
		this.getPlugin().trigger('ENV_gameBegin', event.getData());
	}

	onGameLoaded(event) {
		this.getPlugin().trigger('ENV_gameConditionReceived', event.getData().gameData);
	}
}
