#lx:private;

class WebSocketClient extends lx.socket.WebSocketClient {
	constructor(plugin) {
		let protocol = plugin.core.connectData.protocol;
		let port = plugin.core.connectData.port;
		let channelName = plugin.core.connectData.channelName;
		super(protocol, port, channelName, {
			onChannelEvent: plugin.core.socketEventListener,
			onConnected:   __handler_onConnected,
			onMessage:     __handler_onMessage,
			onClientJoin:  __handler_onClientJoin,
			onClientLeave: __handler_onClientLeave,
			onClose:       __handler_onClose,
			onError:       __handler_onError
		});

		this._plugin = plugin;
		this._core = plugin.core;
	}
}

Plugin.core.classes.WebSocketClient = WebSocketClient;

/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/
function __handler_onConnected(mates, data) {
    console.log('ON CONNECTED');
	console.log(mates);
	console.log(data);

	Plugin.core.lists.gamesList.reset(data.games);
	Plugin.core.lists.currentGamesList.reset(data.currentGames);
}

function __handler_onMessage(msg) {
    console.log('ON MESSAGE');
    console.log(msg);
}

function __handler_onClientJoin(clientData) {
	console.log('ON CLIENT JOIN');
	console.log(clientData);
}

function __handler_onClientLeave(clientData) {
	console.log('ON CLIENT LEAVE');
	console.log(clientData);
}

function __handler_onClose(msg) {
	console.log('ON CLOSE');
	console.log(msg);
}

function __handler_onError(msg) {
	console.log('ON ERROR');
	console.log(msg);
}
