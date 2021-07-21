class SocketEventListener extends lx.socket.EventListener {
	constructor(plugin) {
		super();

		this._plugin = plugin;
		this._core = plugin.core;
	}

	onError(event) {
		lx.Tost.error(event.getData().message);
	}

	onGameCreated(event) {
		let data = event.getData();
		let game = this._core.addPendingGame({
			channelKey: data.channelKey,
			type: data.gameData.name,
			name: data.gameName,
			image: data.gameData.image,
			gamersCurrent: 0,
			gamersRequired: data.gamersRequired,
			isOwned: event.isFromMe()
		});

		if (!event.isFromMe() || !this._core.__inConnecting) return;

		// password
		var connectData = this._core.__inConnecting;
		delete this._core.__inConnecting;
		connectData.protocol = this._core.connectData.protocol;
		connectData.port = this._core.connectData.port;
		connectData.url = this._core.connectData.url;
		connectData.channelKey = data.channelKey;
		connectData.token = data.token;
		connectData.userChannelData = {login: lx.User.login};
		this._core.loadGamePlugin(game, connectData);
	}

	onGameStuffed(event) {
		this._core.dropPendingGame(event.getData().channel);
	}

	onGameClose(event) {
		this._core.dropPendingGame(event.getData().channel);
	}

	onGameStateChange(event) {
		var data = event.getData();
		var game = this._core.getPendingGame(data.channel);
		if (!game) {
			lx.Tost.error('Game state changing error');
			return;
		}

		if (data.count !== undefined) {
			game.gamersCurrent = data.count;
			if (data.follow !== undefined)
				game.follow = data.follow;
		}
	}

	onGameJoining(event) {
		let data = event.getData();

		var game = this._core.getPendingGame(data.channelKey);
		if (!game) {
			lx.Tost.error('Game state changing error');
			return;
		}

		// password
		var connectData = this._core.__inConnecting;
		delete this._core.__inConnecting;
		connectData.protocol = this._core.connectData.protocol;
		connectData.port = this._core.connectData.port;
		connectData.url = this._core.connectData.url;
		connectData.channelKey = data.channelKey;
		connectData.token = data.token;
		connectData.userChannelData = {login: lx.User.login};
		this._core.loadGamePlugin(game, connectData);
	}
}
