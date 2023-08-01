#lx:module lexedo.games;
#lx:module-data {
	i18n: EnvironmentI18n.yaml
};

#lx:use lx.socket.WebSocketClient;

#lx:require src/;

#lx:namespace lexedo.games;
class Environment {
	constructor(plugin, config) {
		this._plugin = plugin;
		plugin.onDestruct(()=>this.destruct());

		this.mode = config.mode || 'prod';
		this.name = config.name || 'Unknown';
		this.type = this._plugin.attributes.gameType;

		this.useScreenLock = (config.useScreenLock === undefined) ? true : config.useScreenLock;
		this.game = null;
		this.gameEventHandler = null;
		this._connector = new Connector(plugin, this, config.game);
	}

	setGame(game, isOnline) {
		this.game = game;
		if (isOnline) {
			__subscribeGameEvents(this);
			this.gameEventHandler = new lexedo.games.GameEventHandler(this, game);
		}
		this._plugin.trigger('ENV_gameCreated');
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

	isOnline() {
		return this._connector.isOnline();
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

	triggerChannelEvent(
		eventName,
		data = {},
		receivers = null,
		returnToSender = true,
		privateMode = false
	) {
		this._connector.trigger(eventName, data, receivers, returnToSender, privateMode);
	}

	lockScreen() {
		if (this.useScreenLock) {
			this.screenLock = new lx.Box({parent: this.getPlugin().root, geom: true});
			this.screenLock.add(lx.Box, {geom: true, fill:'black', opacity:0.5});
			var textWrapper = this.screenLock.add(lx.Box, {geom:true});
			textWrapper.text(#lx:i18n(waiting));
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

function __subscribeGameEvents(self) {
	self.getPlugin().on('ENV_gameStuffed', event=>{
		self.unlockScreen();
		self.game.setPending(false);
	});
	self.getPlugin().on('ENV_gamerReconnected', event=>{
		self.game.setPending(event.getData().reconnectionData.gameIsPending);
		if (!self.game.isPending())
			self.unlockScreen();
	});
	self.getPlugin().on('ENV_observerConnected', event=>{
		self.game.setPending(event.getData().gameIsPending);
		if (!self.game.isPending())
			self.unlockScreen();
	});
}
