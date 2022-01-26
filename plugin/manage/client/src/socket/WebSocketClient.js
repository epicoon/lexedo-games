class WebSocketClient extends lx.socket.WebSocketClient #lx:namespace lexedo.games.manage {
	constructor(core, connectData) {
		super({
			protocol: connectData.protocol,
			port: connectData.port,
			url: connectData.url,
			channel: connectData.channelName,
			handlers: {
				onChannelEvent: new lexedo.games.manage.SocketEventListener(core),
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
		console.log(this);


		// this.request('test').then(res=>{
		// 	console.log(res);
		// });
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
