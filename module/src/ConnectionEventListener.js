#lx:namespace lexedo.games;
class ConnectionEventListener {
	constructor(env) {
		this._environment = env;
	}

	getEnvironment() {
		return this._environment;
	}

	onConnected() {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CONNECTED'));
		}
	}

	onMessage(msg) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON MESSAGE'));
		    console.log(msg);
		}
	}

	onClientJoin(channelMate) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CLIENT JOIN'));
			console.log(channelMate);
		}
	}

	onClientDisconnected(channelMate) {
		if (this._environment.mode == 'dev') {
			console.log(__title(this, 'ON CLIENT DISCONNECTED'));
			console.log(channelMate);
		}
	}

	onClientReconnected(channelMate) {
		if (this._environment.mode == 'dev') {
			console.log(__title(this, 'ON CLIENT RECONNECTED'));
			console.log(channelMate);
		}
	}

	onClientLeave(channelMate) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CLIENT LEAVE'));
			console.log(channelMate);
		}
	}

	onClose(msg) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CLOSE'));
			console.log(msg);
		}
	}

	onError(msg) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON ERROR'));
			console.log(msg);
		}
	}
}

function __title(self, text) {
	return self._environment.name + '['
    	+ self._environment._connector._connectData.channelKey
    	+ '] ' + text;
}
