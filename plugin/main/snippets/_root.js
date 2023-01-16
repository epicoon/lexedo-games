/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;
#lx:use lx.ActiveBox;
#lx:use lx.ConfirmPopup;
#lx:use lx.InputPopup;

var headHeight = '60px';

var headBox = new lx.Box({
    key: 'headBox',
    geom: [0, 0, 100, headHeight]
});
headBox.border();
headBox.gridProportional({indent:'10px'});
headBox.add(lx.Button, {
    key: 'savedGamesBut',
    geom:[9, 0, 3, 1],
    text:#lx:i18n(SavedGames)
});



var mainBox = new lx.Box({
    key: 'mainBox',
    geom: [0, headHeight, 100, null, null, 0]
});
mainBox.border();
mainBox.begin();

var commonChatWindow = new lx.ActiveBox({
    header: #lx:i18n(Common_chat),
    adhesive: true,
    geom: [0, 0, 25, 100]
});

var gamesWindow = new lx.ActiveBox({
    header: #lx:i18n(Available_games),
    adhesive: true,
    geom: [25, 0, 50, 100]
});

var pendingGamesWindow = new lx.ActiveBox({
    header: #lx:i18n(Current_games),
    adhesive: true,
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

new lx.ConfirmPopup();
new lx.InputPopup();
