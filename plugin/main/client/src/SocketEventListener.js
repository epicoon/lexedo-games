#lx:public;

class SocketEventListener extends lx.socket.EventListener {
	constructor(plugin) {
		super();

		this._plugin = plugin;
		this._core = plugin.core;
	}

	onError(event) {
		lx.tostError(event.getData().message);
	}

	onNewUser(event) {
		var data = event.getData();
		this._plugin.core.reset(data.games, data.currentGames);
	}

	onGameCreated(event) {
		let data = event.getData();
		let game = this._core.addPendingGame({
			channelKey: data.channelKey,
			type: data.gameData.type,
			name: data.gameName,
			image: data.gameData.image,
			gamersCurrent: 0,
			gamersRequired: data.gamersRequired,
			requirePassword: data.requirePassword,
			isOwned: event.isFromMe()
		});

		if (!event.isFromMe() || !this._core.__inConnecting) return;

		var connectData = this.__prepareConnectData(data);
		if (connectData)
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
			lx.tostError('Game state changing error');
			return;
		}

		if (data.count !== undefined) {
			game.gamersCurrent = data.count;
			if (data.follow !== undefined)
				game.follow = data.follow;
		}
	}

	onGameJoining(event) {
		let data = event.getData(),
			game = this._core.getPendingGame(data.channelKey);
		if (!game) {
			lx.tostError('Game state changing error');
			return;
		}

		let connectData = this.__prepareConnectData(data);
		if (connectData)
			this._core.loadGamePlugin(game, connectData);
	}

	__prepareConnectData(eventData)
	{
		if (!this._core.__inConnecting) return null;
		var connectData = {
			protocol: this._core.connectData.protocol,
			port: this._core.connectData.port,
			url: this._core.connectData.url,
			channelKey: eventData.channelKey,
			token: eventData.token,
			userChannelData: {login: lx.app.user.login}
		};
		if (this._core.__inConnecting.password != '')
			connectData.password = this._core.__inConnecting.password;
		delete this._core.__inConnecting;
		return connectData;
	}
}
