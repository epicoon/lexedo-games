class Core {
	constructor(plugin) {
		this.plugin = plugin;

		#lx:model-collection gamesList = {
			name,
			image,
			minGamers,
			maxGamers
		};
		#lx:model-collection currentGamesList = {
			channelKey,
			type,
			name,
			image,
			gamersCurrent,
			gamersRequired,
			follow: {default: false},
			isOwned: {default: false}
		};

		this.lists = {
			gamesList,
			currentGamesList
		};
	}

	checkReconnections() {
		var map = lx.Storage.get('lexedogames') || {},
			filter = [],
			reconnections = [];
		if (map.channels) for (let key in map.channels) {
			let connectData = map.channels[key];
			var arr = this.lists.currentGamesList.select({
				channelKey: connectData.channelKey
			});
			if (arr.len != 1) continue;

			var game = arr[0];
			filter.push(connectData.channelKey);
			reconnections.push({game, connectData});
		}

		lx.socket.WebSocketClient.filterReconnectionsData(filter);
		map.channels = {};		
		lx.Storage.set('lexedogames', map);

		for (let i in reconnections) {
			let reconnection = reconnections[i];
			this.loadGamePlugin(reconnection.game, reconnection.connectData);
		}
	}
	
	loadGamePlugin(game, connectData) {
		^Respondent.loadGamePlugin(game.type).then(res=>{
			var box = new lx.ActiveBox({
				header: game.name,
				geom: true //[20, 15, 60, 60]
			});
			box.setPlugin(res, {connectData});
			game.box = box;

			var map = lx.Storage.get('lexedogames') || {};
			if (!map.channels) map.channels = {};
			map.channels[connectData.channelKey] = connectData;  //port protocol url channelKey
			lx.Storage.set('lexedogames', map);
		}).catch(error=>{
			lx.Tost.error(error.error_details[0]);
		});
	}
}
