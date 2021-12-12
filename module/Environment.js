#lx:module lexedo.games;

#lx:use lx.socket.WebSocketClient;

#lx:require src/;

class Environment #lx:namespace lexedo.games {
	constructor(plugin, config) {
		this._plugin = plugin;
		this._eventCore = new lx.EventDispatcher();

		plugin.onDestruct(()=>this.destruct());

		this.mode = config.mode || 'prod';
		this.name = config.name || 'Unknown';
		this.type = this._plugin.attributes.gameType;

		this.useScreenLock = (config.useScreenLock === undefined) ? true : config.useScreenLock;
		this.game = null;
		this._connector = new Connector(plugin, this, config.game);
	}

	setGame(game) {
		this.game = game;
	}

	getPlugin() {
		return this._plugin;
	}

	getSocket() {
		return this._connector.socket;
	}

	getGame() {
		return this.game;
	}

	socketRequest(route, data = {}) {
		if (!this._connector.socket) return {
			then: function(callback) {
				console.error('Socket connection doesn\'t exist');
			}
		};

		return this._connector.socket.request(route, data);
	}

	commonSocketRequest(route, data = {}) {
		if (!this._plugin || !this._plugin.parent || !this._plugin.parent.core || !this._plugin.parent.core.socket) return {
			then: function(callback) {
				console.error('Socket connection doesn\'t exist');
			}
		};

		return this._plugin.parent.core.socket.request(route, data);
	}

	destruct() {
		this._connector.leave();
	}

	triggerChannelEvent(eventName, data = {}, receivers = null, privateMode = false) {
		this._connector.trigger(eventName, data, receivers, privateMode);
	}

	triggerEvent(eventName, params = []) {
		this._eventCore.trigger(eventName, params);
	}

	subscribeEvent(eventName, callback) {
		this._eventCore.subscribe(eventName, callback);
	}

	onChangeGamersList(data) {
		this.game.onChangeGamersList(data);
	}

	onObserverJoined(data) {
		this.game.setPending(data.gameIsPending);
		if (!this.game.isPending())
			this.unlockScreen();
		this.game.onObserverJoined(data);
	}

	onSetGameReferences(data) {
		this.game.setGameReferences(data);
	}

	onGameStuffed() {
		this.unlockScreen();
		this.game.onStuffed();
		this.game.setPending(false);
	}

	onGameBegin(data) {
		this.game.onBegin(data);
	}

	onGameLoaded(data) {
		this.game.onLoaded(data);
	}

	onGamerReconnected(data) {
		this.game.setPending(data.gameIsPending);
		if (!this.game.isPending())
			this.unlockScreen();
		this.game.onGamerReconnected(data);
	}

	lockScreen() {
		if (this.useScreenLock) {
			this.screenLock = new lx.Box({geom: true});
			this.screenLock.add(lx.Box, {geom: true, style:{fill:'black', opacity:0.5}});
			var textWrapper = this.screenLock.add(lx.Box, {geom:true});
			textWrapper.text('Waiting for players...');
			textWrapper.style('color', 'white');
			textWrapper->text.style('fontSize', '2em');
			textWrapper.align(lx.CENTER, lx.MIDDLE);
		}
	}

	unlockScreen() {
		if (this.useScreenLock) {
			this.screenLock.del();
			delete this.screenLock;
			this.useScreenLock = false;
		}
	}
}
