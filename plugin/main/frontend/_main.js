/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Image;
#lx:use lx.socket.WebSocketClient;

#lx:require src/;

Plugin.core = new Core(Plugin);
^Respondent.getConnectData().then(res=>{
	Plugin.core.connectData = res;
	Plugin.core.socketEventListener = new SocketEventListener(Plugin);
	Plugin.core.socket = new WebSocketClient(Plugin);
	
	Plugin.core.socket.connect({login: lx.User.login}, {
		auth: lx.Storage.get('lxauthtoken'),
		cookie: document.cookie
	});
});




const gamesBox = Snippet->>gamesBox;
gamesBox.matrix({
	items: Plugin.core.lists.gamesList,
	itemBox: lx.Box,
	itemRender: function(box, model) {
		var img = box.add(lx.Image, {geom: true, filename: model.image});
		img.adapt();
		box.on('resize', ()=>img.adapt());
		box.align(lx.CENTER, lx.MIDDLE);
		box.addClass('lx-Button');
		box.click(()=>createGame(model));
	}
});

const currentGamesBox = Snippet->>currentGamesBox;
currentGamesBox.matrix({
	items: Plugin.core.lists.currentGamesList,
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
			switchRelationToGame(Plugin.core.lists.currentGamesList.at(this.index));
		});
		box.setField('follow', function(val) {
			this.fill(val ? 'lightgreen' : '');
		});
	}
});




function createGame(gameData) {
	var params = [#lx:i18n(NewGameName), #lx:i18n(Password)];
	if (gameData.minGamers != gameData.maxGamers)
		params.push('Number of gamers ('+gameData.minGamers+'-'+gameData.maxGamers+')');

	Plugin->inputPopup.open(params, (values)=>{
		let gamers = (gameData.minGamers != gameData.maxGamers)
			? values[2]
			: gameData.minGamers;

		Plugin.core.__inConnecting = { password: values[1] };

		Plugin.core.socket.trigger('newGame', {
			type: gameData.name,
			name: values[0],
			password: values[1],
			gamers
		});
	});
}


function switchRelationToGame(game) {
	if (game.follow) {
		Plugin->confirmPopup.open(#lx:i18n(ToLeave), ()=>{
			game.box.del();
		});
	} else {
		//TODO password
		Plugin->confirmPopup.open(#lx:i18n(ToJoin), ()=>{
			
			Plugin.core.__inConnecting = {};

			Plugin.core.socket.trigger('askForJoin', {
				key: game.channelKey
			});
		});
	}
}
