#lx:public;

class WebSocketClient extends lx.socket.WebSocketClient {
	constructor(plugin) {
		super({
			protocol: plugin.core.connectData.protocol,
			port: plugin.core.connectData.port,
			url: plugin.core.connectData.url,
			channel: plugin.core.connectData.channelName,
			handlers: {
				onChannelEvent: plugin.core.socketEventListener,
				onConnected:   __WebSocketHandlers.onConnected,
				onMessage:     __WebSocketHandlers.onMessage,
				onClientJoin:  __WebSocketHandlers.onClientJoin,
				onClientLeave: __WebSocketHandlers.onClientLeave,
				onClientDisconnected: __WebSocketHandlers.onClientDisconnected,
				onClose:       __WebSocketHandlers.onClose,
				onError:       __WebSocketHandlers.onError
			}
		});

		this._plugin = plugin;
		this._core = plugin.core;
	}
}

const __WebSocketHandlers = {
	onConnected: function() {
	    console.log('ON CLIENT CONNECTED');
		console.log(this);

		this._core.checkReconnections();
	},

	onMessage: function(event) {
	    console.log('ON MESSAGE');
	    console.log(event.payload.message);
	},

	onClientJoin: function(event) {
		console.log('ON CLIENT JOIN');
		console.log(event.payload.mate);
	},

	onClientDisconnected: function (event) {
		console.log('ON CLIENT DISCONNECTED');
		console.log(event.payload.mate);
	},

	onClientLeave: function(event) {
		console.log('ON CLIENT LEAVE');
		console.log(event.payload.mate);
	},

	onClose: function(event) {
		console.log('ON CLOSE');
		console.log(event);
	},

	onError: function(event) {
		console.log('ON ERROR');
		console.log(event);
	}
};
