class WebSocketClient extends lx.socket.WebSocketClient {
	constructor(config) {
		var env = config.env;
		var superConfig = {};
		if (config.channelEventListener)
			superConfig.onChannelEvent = config.channelEventListener.isString
				? lx.createObject(config.channelEventListener, [env])
				: new config.channelEventListener(env);

		if (!config.connectionEventListener)
			config.connectionEventListener = lexedo.games.ConnectionEventListener;

		var listener = config.connectionEventListener.isString
			? lx.createObject(config.connectionEventListener, [env])
			: new config.connectionEventListener(env);
		if (listener.onConnected)
			superConfig.onConnected = listener.onConnected;
		if (listener.onMessage)
			superConfig.onMessage = listener.onMessage;
		if (listener.onClientJoin)
			superConfig.onClientJoin = listener.onClientJoin;
		if (listener.onClientLeave)
			superConfig.onClientLeave = listener.onClientLeave;
		if (listener.onClose)
			superConfig.onClose = listener.onClose;
		if (listener.onError)
			superConfig.onError = listener.onError;

		super(config.protocol, config.port, config.channel, superConfig);

		this._environment = env;
	}

	getEnvironment() {
		return this._environment;
	}
}
