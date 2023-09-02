#lx:namespace lxGames;
class Core extends lx.PluginCore {
	#lx:const
		ONLINE_ONLY = #lx:php(\lexedo\games\GamePlugin::ONLINE_ONLY),
		LOCAL_ONLY = #lx:php(\lexedo\games\GamePlugin::LOCAL_ONLY),
		ONLINE_AND_LOCAL = #lx:php(\lexedo\games\GamePlugin::ONLINE_AND_LOCAL);

	init() {
		this.connectData = {};
		this.socketEventListener = null;
		this.socket = null;

		this.lists = {
			gamePropotypes: lx.ModelCollection.create({
				schema: [
					'type',
					'connectionType',
					'title',
					'image',
					'minGamers',
					'maxGamers'
				]
			}),
			pendingGames: lx.ModelCollection.create({
				schema: {
					channelKey: {},
					type: {},
					name: {},
					image: {},
					gamersCurrent: {},
					gamersRequired: {},
					requirePassword: {default: false},
					follow: {default: false},
					isOwned: {default: false}
				}
			}),
			stuffedGames: lx.ModelCollection.create({
				schema: [
					'channelKey',
					'type',
					'name'
				]
			})
		};

		this.__initGui();
		^Respondent.getConnectData().then(res=>{
			this.connectData = res.data;
			this.socketEventListener = new SocketEventListener(this.plugin);
			this.socket = new WebSocketClient(this.plugin);

			this.socket.connect({login: lx.app.user.login}, {
				auth: lx.app.storage.get('lxauthtoken'),
				cookie: document.cookie
			});
		});
	}

	reset(games, currentGames) {
		this.lists.gamePropotypes.reset(games);
		this.lists.pendingGames.reset(currentGames);
		this.lists.stuffedGames.reset();
	}

	getStuffedGame(channelKey) {
		var arr = (new lx.CollectionSelector())
			.setCollection(this.lists.stuffedGames)
			.ifPropertiesAre({channelKey})
			.getResult();
		return arr.at(0);
	}

	getPendingGame(channelKey) {
		var arr = (new lx.CollectionSelector())
			.setCollection(this.lists.pendingGames)
			.ifPropertiesAre({channelKey})
			.getResult();
		return arr.at(0);
	}

	addPendingGame(config) {
		return this.lists.pendingGames.add(config);
	}

	dropPendingGame(channelKey) {
		this.lists.pendingGames.removeByData({channelKey});
	}

	checkReconnections() {
		this.socket.request('checkReconnections').then(stuffedGamesList=>{
			var map = lx.app.storage.get('lexedogames') || {};
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
			lx.app.storage.set('lexedogames', map);

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
					click: ()=>lx.ConfirmPopup.open(#lx:i18n(ToLeave)).confirm(()=>box.del())
				}
			});
			box->body.overflow('hidden');
			box.setPlugin(res.data, {connectData, gameType: game.type});
			game.box = box;

			if (connectData) {
				var map = lx.app.storage.get('lexedogames') || {};
				if (!map.channels) map.channels = {};
				map.channels[connectData.channelKey] = connectData;  //port protocol url channelKey
				lx.app.storage.set('lexedogames', map);
			}
		}).catch(error=>{
			lx.tostError(error.error_details[0]);
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
				lx.ConfirmPopup.open(#lx:i18n(OnlineOrLocal))
					.confirm(()=>this.__createOnlineGame(gameData))
					.reject(()=>this.loadGamePlugin({type: gameData.type}, null));
				break;
		}
	}

	__createOnlineGame(gameData) {
		let params = [#lx:i18n(NewGameName), #lx:i18n(Password)];
		if (gameData.minGamers != gameData.maxGamers)
			params.push(#lx:i18n(GamersCount, {min: gameData.minGamers, max: gameData.maxGamers}));

		lx.InputPopup.open(params).confirm((values)=>{
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
			lx.ConfirmPopup.open(#lx:i18n(ToLeave)).confirm(()=>game.box.del());
		} else {
			lx.ConfirmPopup.open(#lx:i18n(ToJoin), {asObserver:#lx:i18n(AsObserver)}, 3)
				.confirm(()=>this.__tryConnect(game))
				.asObserver(()=>this.__tryConnect(game, true));
		}
	}

	__tryConnect(game, isObserver = false) {

		// console.log( game );

		if (game.requirePassword) {
			lx.InputPopup.open([#lx:i18n(Password)]).confirm((values)=>{
				let password = values[0];
				this.__connect(game, isObserver, password);
			});
		} else {
			this.__connect(game, isObserver);
		}
	}

	__connect(game, isObserver, password = '') {
		this.__inConnecting = {password};
		let data = {key: game.channelKey};
		if (isObserver) data.isObserver = true;
		this.socket.trigger('askForJoin', data);
	}

	__initGui() {
		#lx:use lx.Image;
		#lx:use lexedo.games.SaveMenu;

		const core = this;

		this.plugin->>savedGamesBut.click(()=>{
			let saveMenu = new lexedo.games.SaveMenu();
			saveMenu.setCore(this);
		});

		this.plugin->>gamesBox.matrix({
			items: this.lists.gamePropotypes,
			itemBox: lx.Box,
			itemRender: function(box, model) {
				let gameBox = new lx.Box({geom: true});
				gameBox.streamProportional({paddingTop:'10px'});
				let imgWrapper = gameBox.add(lx.Box);
				let title = gameBox.add(lx.Box, {height: '20%', text: model.title});
				title.align(lx.CENTER, lx.MIDDLE);
				let img = imgWrapper.add(lx.Image, {geom: true, filename: model.image});
				img.adapt();
				imgWrapper.on('resize', ()=>img.adapt());
				imgWrapper.align(lx.CENTER, lx.MIDDLE);
				gameBox.addClass('lx-Button');
				gameBox.click(()=>core.__createGame(model));
			}
		});

		this.plugin->>currentGamesBox.matrix({
			items: this.lists.pendingGames,
			itemBox: lx.Box,
			itemRender: function(box, model) {
				box.addClass('lgmain-curgamebox');
				box.grid({
					step: '10px',
					minWidth: '20px'
				});

				let imageWrapper = box.add(lx.Box, {width: 2});
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
					this.toggleClassOnCondition(val, 'lgmain-curgamebox-follow');
				});
			}
		});
	}
}
