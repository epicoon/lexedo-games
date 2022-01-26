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

	onMessage: function(msg) {
	    console.log('ON MESSAGE');
	    console.log(msg);
	},

	onClientJoin: function(clientData) {
		console.log('ON CLIENT JOIN');
		console.log(clientData);
	},

	onClientDisconnected: function (clientData) {
		console.log('ON CLIENT DISCONNECTED');
		console.log(clientData);
	},

	onClientLeave: function(clientData) {
		console.log('ON CLIENT LEAVE');
		console.log(clientData);
	},

	onClose: function(msg) {
		console.log('ON CLOSE');
		console.log(msg);
	},

	onError: function(msg) {
		console.log('ON ERROR');
		console.log(msg);
	}
};
