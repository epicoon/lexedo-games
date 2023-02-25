#lx:namespace lxGames.manage;
class WebSocketClient extends lx.socket.WebSocketClient {
	constructor(core, connectData) {
		super({
			protocol: connectData.protocol,
			port: connectData.port,
			url: connectData.url,
			channel: connectData.channelName,
			reconnect: false,
			handlers: {
				onChannelEvent: new lxGames.manage.SocketEventListener(core),
				onConnected:   __WebSocketHandlers.onConnected,
				onMessage:     __WebSocketHandlers.onMessage,
				onClientJoin:  __WebSocketHandlers.onClientJoin,
				onClientLeave: __WebSocketHandlers.onClientLeave,
				onClientDisconnected: __WebSocketHandlers.onClientDisconnected,
				onClose:       __WebSocketHandlers.onClose,
				onError:       __WebSocketHandlers.onError
			}
		});

		this.core = core;
	}
}

const __WebSocketHandlers = {
	onConnected: function() {
	    console.log('ON CLIENT CONNECTED');

		this.core.getPlugin().trigger('connectionEstablished');
	},

	onMessage: function(message) {
	    console.log('ON MESSAGE');
	    console.log(message);
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

		this.core.getPlugin().trigger('connectionClosed');
	},

	onError: function(event) {
		console.log('ON ERROR');
		console.log(event);

		this.core.getPlugin().trigger('connectionClosed');
	}
};
