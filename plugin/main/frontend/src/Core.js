class Core {
	#lx:const
		ONLINE_ONLY = #lx:php(\lexedo\games\GamePlugin::ONLINE_ONLY),
		LOCAL_ONLY = #lx:php(\lexedo\games\GamePlugin::LOCAL_ONLY),
		ONLINE_AND_LOCAL = #lx:php(\lexedo\games\GamePlugin::ONLINE_AND_LOCAL);

	constructor(plugin) {
		this.plugin = plugin;
		this.connectData = {};
		this.socketEventListener = null;
		this.socket = null;

		#lx:model-collection gamePropotypes = {
			type,
			connectionType,
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
			var plugin = this.plugin;
			var box = new lx.ActiveBox({
				header: game.type,
				geom: true, //[20, 15, 60, 60]
				closeButton: {
					click: ()=>plugin.root->confirmPopup.open(#lx:i18n(ToLeave)).confirm(()=>box.del())
				}
			});
			box.setPlugin(res.data, {connectData, gameType: game.type});
			game.box = box;

			if (connectData) {
				var map = lx.Storage.get('lexedogames') || {};
				if (!map.channels) map.channels = {};
				map.channels[connectData.channelKey] = connectData;  //port protocol url channelKey
				lx.Storage.set('lexedogames', map);
			}
		}).catch(error=>{
			lx.Tost.error(error.error_details[0]);
		});
	}

	__createGame(gameData) {
		switch (gameData.connectionType) {
			case self::LOCAL_ONLY:
				this.loadGamePlugin({type: gameData.type}, null);
				break;
			case self::ONLINE_ONLY:
				this.__createOnlineGame(gameData);
				break;
			case self::ONLINE_AND_LOCAL:
				this.plugin.root->confirmPopup.open(#lx:i18n(OnlineOrLocal))
					.confirm(()=>this.__createOnlineGame(gameData))
					.reject(()=>this.loadGamePlugin({type: gameData.type}, null));
				break;
		}
	}

	__createOnlineGame(gameData) {
		var params = [#lx:i18n(NewGameName), #lx:i18n(Password)];
		if (gameData.minGamers != gameData.maxGamers)
			params.push(#lx:i18n(GamersCount, {min: gameData.minGamers, max: gameData.maxGamers}));

		this.plugin.root->inputPopup.open(params).confirm((values)=>{
			let gamers = (gameData.minGamers != gameData.maxGamers)
				? values[2]
				: gameData.minGamers;

			this.__inConnecting = {
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
			this.plugin.root->confirmPopup.open(#lx:i18n(ToLeave)).confirm(()=>game.box.del());
		} else {
			this.plugin.root->confirmPopup.open(#lx:i18n(ToJoin), {asObserver:#lx:i18n(AsObserver)})
				.confirm(()=>{
					//TODO password
					this.__inConnecting = {password: ''};
					this.socket.trigger('askForJoin', {key:game.channelKey});
				})
				.asObserver(()=>{
					//TODO password
					this.__inConnecting = {password: ''};
					this.socket.trigger('askForJoin', {key:game.channelKey, isObserver:true});
				});
		}
	}

	__initGui() {
		#lx:use lx.Image;
		#lx:use lexedo.games.SaveMenu;

		var core = this;

		this.plugin->>savedGamesBut.click(()=>{
			let saveMenu = new lexedo.games.SaveMenu();
			saveMenu.setCore(this);
		});

		this.plugin->>gamesBox.matrix({
			items: this.lists.gamePropotypes,
			itemBox: lx.Box,
			itemRender: function(box, model) {
				var gameBox = new lx.Box({geom: true});
				var img = gameBox.add(lx.Image, {geom: true, filename: model.image});
				img.adapt();
				gameBox.on('resize', ()=>img.adapt());
				gameBox.align(lx.CENTER, lx.MIDDLE);
				gameBox.addClass('lx-Button');
				gameBox.click(()=>core.__createGame(model));
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
