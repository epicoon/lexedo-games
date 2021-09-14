class Connector {
	constructor(plugin, env, gameConfig) {
		this._plugin = plugin;
		this._environment = env;
		this._gameConfig = gameConfig;

		this._isOnlineMode = !!(this._plugin.attributes && this._plugin.attributes.connectData);
		this._connectData = (this._isOnlineMode)
			? this._plugin.attributes.connectData
			: {};

		this.socket = null;

		this.run();
	}

	isOnline() {
		return this._isOnlineMode;
	}

	run() {
		if (this._gameConfig.isString) {
			this.initGame(this._gameConfig);
		} else if (this._gameConfig.isObject) {
			var className = this._gameConfig.class;
			if (this.isOnline() && this._gameConfig.online) {
				if (this._gameConfig.online.class)
					this._gameConfig.class = this._gameConfig.online.class;
				if (this._gameConfig.online.channelEventListener)
					this._gameConfig.channelEventListener = this._gameConfig.online.channelEventListener;
				if (this._gameConfig.online.connectionEventListener)
					this._gameConfig.connectionEventListener = this._gameConfig.online.connectionEventListener;
				this._plugin.useModule(
					this._gameConfig.online.module,
					()=>this.initGame(className)
				);
			} else if (!this.isOnline() && this._gameConfig.local) {
				if (this._gameConfig.local.class)
					this._gameConfig.class = this._gameConfig.local.class;
				this._plugin.useModule(
					this._gameConfig.local.module,
					()=>this.initGame(className)
				);
			} else {
				this.initGame(className);
			}
		} else {
			console.error('Wrong game configuration');
			return;
		}
	}

	connect() {
		var socket = new WebSocketClient({
			protocol: this._connectData.protocol,
			port: this._connectData.port,
			url: this._connectData.url,
			channel: this._connectData.channelKey,
			env: this._environment,
			connectionEventListener: this._gameConfig.connectionEventListener,
			channelEventListener: this._gameConfig.channelEventListener
		});
		socket.connect(this._connectData.userChannelData || {}, {token: this._connectData.token});
		this.socket = socket;
	}

	leave() {
		if (this.socket)
			this.socket.close();
	}

	trigger(eventName, data, receivers = null, privateMode = false) {
		if (this.socket)
			this.socket.trigger(eventName, data, receivers, privateMode);
		else
			console.error('Socket is undefined');
	}

	initGame(className) {
		this._environment.setGame(lx.createObject(className, [this._environment]));

		if (this.isOnline()) {
			this._environment.lockScreen();
			this.connect();
		}
	}
}
