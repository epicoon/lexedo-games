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

		this.#initGui();
	}

	run() {
		^Respondent.getConnectData().then(res=>{
			this.connectData = res;
			this.socketEventListener = new SocketEventListener(this.plugin);
			this.socket = new WebSocketClient(this.plugin);
			
			this.socket.connect({login: lx.User.login}, {
				auth: lx.Storage.get('lxauthtoken'),
				cookie: document.cookie
			});
		});
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

	#createGame(gameData) {
		var params = [#lx:i18n(NewGameName), #lx:i18n(Password)];
		if (gameData.minGamers != gameData.maxGamers)
			params.push('Number of gamers ('+gameData.minGamers+'-'+gameData.maxGamers+')');

		this.plugin->>inputPopup.open(params, (values)=>{
			let gamers = (gameData.minGamers != gameData.maxGamers)
				? values[2]
				: gameData.minGamers;

			this.__inConnecting = { password: values[1] };

			this.socket.trigger('newGame', {
				type: gameData.name,
				name: values[0],
				password: values[1],
				gamers
			});
		});
	}


	#switchRelationToGame(game) {
		if (game.follow) {
			this.plugin->>confirmPopup.open(#lx:i18n(ToLeave), ()=>{
				game.box.del();
			});
		} else {
			//TODO password
			this.plugin->>confirmPopup.open(#lx:i18n(ToJoin), ()=>{
				
				this.__inConnecting = {};

				this.socket.trigger('askForJoin', {
					key: game.channelKey
				});
			});
		}
	}

	#initGui() {
		var core = this;

		this.plugin->>gamesBox.matrix({
			items: this.lists.gamesList,
			itemBox: lx.Box,
			itemRender: function(box, model) {
				var img = box.add(lx.Image, {geom: true, filename: model.image});
				img.adapt();
				box.on('resize', ()=>img.adapt());
				box.align(lx.CENTER, lx.MIDDLE);
				box.addClass('lx-Button');
				box.click(()=>core.#createGame(model));
			}
		});

		this.plugin->>currentGamesBox.matrix({
			items: this.lists.currentGamesList,
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
					core.#switchRelationToGame(core.lists.currentGamesList.at(this.index));
				});
				box.setField('follow', function(val) {
					this.fill(val ? 'lightgreen' : '');
				});
			}
		});
	}
}
