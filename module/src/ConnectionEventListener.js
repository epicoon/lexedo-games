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

	onMessage(event) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON MESSAGE'));
		    console.log(event.payload.message);
		}
	}

	onClientJoin(event) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CLIENT JOIN'));
			console.log(event.payload.mate);
		}
	}

	onClientDisconnected(event) {
		if (this._environment.mode == 'dev') {
			console.log(__title(this, 'ON CLIENT DISCONNECTED'));
			console.log(event.payload.mate);
		}
	}

	onClientReconnected(event) {
		if (this._environment.mode == 'dev') {
			console.log(__title(this, 'ON CLIENT RECONNECTED'));
			console.log(event.payload.mate);
		}
	}

	onClientLeave(event) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CLIENT LEAVE'));
			console.log(event.payload.mate);
		}
	}

	onClose(event) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON CLOSE'));
			console.log(event);
		}
	}

	onError(event) {
		if (this._environment.mode == 'dev') {
		    console.log(__title(this, 'ON ERROR'));
			console.log(event);
		}
	}
}

function __title(self, text) {
	return self._environment.name + '['
    	+ self._environment._connector._connectData.channelKey
    	+ '] ' + text;
}
