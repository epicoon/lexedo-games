class Core {
	constructor(plugin) {
		this.plugin = plugin;
		this.connectData = {};
		this.socketEventListener = null;
		this.socket = null;

		#lx:model-collection gamePropotypes = {
			type,
			image,
			minGamers,
			maxGamers
		};
		#lx:model-collection pendingGames = {
			channelKey,
			type,
			name,
			image,
			gamersCurrent,
			gamersRequired,
			follow: {default: false},
			isOwned: {default: false}
		};
		#lx:model-collection stuffedGames = {
			channelKey,
			type,
			name
		};

		this.lists = {
			gamePropotypes,
			pendingGames,
			stuffedGames
		};

		this.__initGui();
	}
	
	reset(games, currentGames) {
		this.lists.gamePropotypes.reset(games);
		this.lists.pendingGames.reset(currentGames);
		this.lists.stuffedGames.reset();
	}

	run() {
		^Respondent.getConnectData().then(res=>{
			this.connectData = res.data;
			this.socketEventListener = new SocketEventListener(this.plugin);
			this.socket = new WebSocketClient(this.plugin);
			
			this.socket.connect({login: lx.User.login}, {
				auth: lx.Storage.get('lxauthtoken'),
				cookie: document.cookie
			});
		});
	}

	getStuffedGame(channelKey) {
		var arr = this.lists.stuffedGames.select({channelKey});
		if (arr.len != 1) return null;
		return arr[0];
	}
	
	getPendingGame(channelKey) {
		var arr = this.lists.pendingGames.select({channelKey});
		if (arr.len != 1) return null;
		return arr[0];
	}
	
	addPendingGame(config) {
		return this.lists.pendingGames.add(config);
	}

	dropPendingGame(channelKey) {
		this.lists.pendingGames.removeByData({channelKey});
	}

	checkReconnections() {
		this.socket.request('checkReconnections').then(stuffedGamesList=>{
			var map = lx.Storage.get('lexedogames') || {};
			if (!map.channels) return;

			this.lists.stuffedGames.reset(stuffedGamesList);
			var filter = [],
				reconnections = [];
			for (let key in map.channels) {
				let connectData = map.channels[key];
				var game = this.getPendingGame(connectData.channelKey) || this.getStuffedGame(connectData.channelKey);
				if (!game) continue;
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
		});
	}
	
	loadGamePlugin(game, connectData) {
		^Respondent.loadGamePlugin(game.type).then(res=>{
			var box = new lx.ActiveBox({
				header: game.type,
				geom: true //[20, 15, 60, 60]
			});
			box.setPlugin(res.data, {connectData});
			game.box = box;

			var map = lx.Storage.get('lexedogames') || {};
			if (!map.channels) map.channels = {};
			map.channels[connectData.channelKey] = connectData;  //port protocol url channelKey
			lx.Storage.set('lexedogames', map);
		}).catch(error=>{
			lx.Tost.error(error.error_details[0]);
		});
	}

	__createGame(gameData) {
		var params = [#lx:i18n(NewGameName), #lx:i18n(Password)];
		if (gameData.minGamers != gameData.maxGamers)
			params.push('Number of gamers ('+gameData.minGamers+'-'+gameData.maxGamers+')');

		this.plugin->>inputPopup.open(params, (values)=>{
			let gamers = (gameData.minGamers != gameData.maxGamers)
				? values[2]
				: gameData.minGamers;

			this.__inConnecting = {
				gameType: gameData.type,
				password: values[1]
			};

			this.socket.trigger('newGame', {
				type: gameData.type,
				name: values[0],
				password: values[1],
				gamers
			});
		});
	}

	__switchRelationToGame(game) {
		if (game.follow) {
			this.plugin->>confirmPopup.open(#lx:i18n(ToLeave), ()=>{
				game.box.del();
			});
		} else {
			//TODO password
			this.plugin->>confirmPopup.open(#lx:i18n(ToJoin), ()=>{
				this.__inConnecting = {
					gameType: game.type
				};

				this.socket.trigger('askForJoin', {
					key: game.channelKey
				});
			});
		}
	}

	__initGui() {
		#lx:use lx.Image;

		var core = this;

		this.plugin->>gamesBox.matrix({
			items: this.lists.gamePropotypes,
			itemBox: lx.Box,
			itemRender: function(box, model) {
				var img = box.add(lx.Image, {geom: true, filename: model.image});
				img.adapt();
				box.on('resize', ()=>img.adapt());
				box.align(lx.CENTER, lx.MIDDLE);
				box.addClass('lx-Button');
				box.click(()=>core.__createGame(model));
			}
		});

		this.plugin->>currentGamesBox.matrix({
			items: this.lists.pendingGames,
			itemBox: lx.Box,
			itemRender: function(box, model) {
				box.grid({
					step: '10px',
					minWidth: '20px'
				});

				let imageWrapper = box.add(lx.Box, {width: 2});
				imageWrapper.fill('white');
				var img = imageWrapper.add(lx.Image, {geom: true, filename: model.image});
				img.adapt();
				imageWrapper.align(lx.CENTER, lx.MIDDLE);

				box.add(lx.Box, {field:'name', width: 7}).align(lx.CENTER, lx.MIDDLE);
				box.add(lx.Box, {field:'gamersCurrent'}).align(lx.CENTER, lx.MIDDLE);
				box.add(lx.Box, {text:'/'}).align(lx.CENTER, lx.MIDDLE);
				box.add(lx.Box, {field:'gamersRequired'}).align(lx.CENTER, lx.MIDDLE);
				box.click(function() {
					core.__switchRelationToGame(core.lists.pendingGames.at(this.index));
				});
				box.setField('follow', function(val) {
					this.fill(val ? 'lightgreen' : '');
				});
			}
		});
	}
}
