#lx:public;

class WebSocketClient extends lx.socket.WebSocketClient {
	constructor(config) {
		var env = config.env;
		var superConfig = {};
		if (config.channelEventListener)
			superConfig.onChannelEvent = lx.isString(config.channelEventListener)
				? lx.createObject(config.channelEventListener, [env])
				: new config.channelEventListener(env);

		if (!config.connectionEventListener)
			config.connectionEventListener = lexedo.games.ConnectionEventListener;

		var listener = lx.isString(config.connectionEventListener)
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
		if (listener.onClientDisconnected)
			superConfig.onClientDisconnected = listener.onClientDisconnected;
		if (listener.onClientReconnected)
			superConfig.onClientReconnected = listener.onClientReconnected;
		if (listener.onClose)
			superConfig.onClose = listener.onClose;
		if (listener.onError)
			superConfig.onError = listener.onError;

		super({
			protocol: config.protocol,
			port: config.port,
			url: config.url,
			channel: config.channel,
			handlers: superConfig
		});

		this._environment = env;
	}

	getEnvironment() {
		return this._environment;
	}
}
