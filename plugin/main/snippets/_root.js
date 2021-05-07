/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

var headHeight = '60px';

var headBox = new lx.Box({
	key: 'headBox',
	geom: [0, 0, 100, headHeight]
});
headBox.border();


var mainBox = new lx.Box({
	key: 'mainBox',
	geom: [0, headHeight, 100, null, null, 0]
});
mainBox.border();

mainBox.begin();

	var commonChatWindow = new lx.ActiveBox({
		header: #lx:i18n(Common_chat),
		geom: [0, 0, 25, 100]
	});

	var gamesWindow = new lx.ActiveBox({
		header: #lx:i18n(Available_games),
		geom: [25, 0, 50, 100]
	});

	var pendingGamesWindow = new lx.ActiveBox({
		header: #lx:i18n(Current_games),
		geom: [75, 0, 25, 100]
	});

mainBox.end();

var gamesBox = gamesWindow.add(lx.Box, {key: 'gamesBox'});
gamesBox.grid({
	indent: '20px',
	cols: 3,
	minHeight: '200px'
});

var currentGamesBox = pendingGamesWindow.add(lx.Box, {key: 'currentGamesBox'});
currentGamesBox.stream({
	indent: '10px',
	minHeight: '40px'
});


Snippet.addSnippet({plugin:'lx/tools:snippets', snippet:'confirmPopup'});
Snippet.addSnippet({plugin:'lx/tools:snippets', snippet:'inputPopup'});
