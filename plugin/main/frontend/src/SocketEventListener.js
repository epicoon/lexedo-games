#lx:private;

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
		let game = this._plugin.core.lists.currentGamesList.add({
			channelKey: data.channelKey,
			type: data.gameData.name,
			name: data.gameName,
			image: data.gameData.image,
			gamersCurrent: 0,
			gamersRequired: data.gamersRequired,
			isOwned: event.isFromMe()
		});

		if (!event.isFromMe() || !this._plugin.core.__inConnecting) return;

		this._plugin.core.__inConnecting.port = this._plugin.core.connectData.port;
		this._plugin.core.__inConnecting.channelKey = data.channelKey;
		this._plugin.core.__inConnecting.token = data.token;
		this._plugin.core.__inConnecting.userChannelData = {name: lx.User.name};
		^Respondent.loadGamePlugin(data.gameData.name).then(res=>{
			var box = new lx.ActiveBox({
				header: data.gameName,
				geom: true //[20, 15, 60, 60]
			});
			box.setPlugin(res);
			game.box = box;
		}).catch(error=>{
			lx.Tost.error(error.error_details[0]);
		});
	}

	onGameStuffed(event) {
		this._plugin.core.lists.currentGamesList.removeByData({
			channelKey: event.getData().channel
		});
	}

	onGameClose(event) {
		this._plugin.core.lists.currentGamesList.removeByData({
			channelKey: event.getData().channel
		});
	}

	onGameStateChange(event) {
		var arr = this._plugin.core.lists.currentGamesList.select({
			channelKey: event.getData().channel
		});
		if (arr.len != 1) {
			lx.Tost.error('Game state changing error');
			return;
		}

		var game = arr[0];
		var data = event.getData();

		if (data.count !== undefined) {
			game.gamersCurrent = data.count;
			if (data.follow !== undefined)
				game.follow = data.follow;
		}
	}

	onGameJoining(event) {
		let data = event.getData();

		var arr = this._plugin.core.lists.currentGamesList.select({
			channelKey: data.channelKey
		});
		if (arr.len != 1) {
			lx.Tost.error('Game state changing error');
			return;
		}

		var game = arr[0];
		this._plugin.core.__inConnecting.port = this._plugin.core.connectData.port;
		this._plugin.core.__inConnecting.channelKey = data.channelKey;
		this._plugin.core.__inConnecting.token = data.token;
		this._plugin.core.__inConnecting.userChannelData = {name: lx.User.name};
		^Respondent.loadGamePlugin(game.type).then(res=>{
			var box = new lx.ActiveBox({
				header: game.name,
				geom: true //[20, 15, 60, 60]
			});
			box.setPlugin(res);
			game.box = box;
		}).catch(error=>{
			lx.Tost.error(error.error_details[0]);
		});
	}
}

Plugin.core.classes.SocketEventListener = SocketEventListener;
