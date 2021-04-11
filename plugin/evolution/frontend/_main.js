/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

#lx:require -R src/;


/*
- сохранение/загрузка
*/


Plugin.environment = new lexedo.games.Environment(Plugin, {
	mode: 'dev',
	name: 'Evolution',
	game: {
		class: 'lexedo.games.Evolution.Game',
		channelEventListener: 'lexedo.games.Evolution.EventListener',
		connectionEventListener: 'lexedo.games.Evolution.ConnectionEventListener'
	}
});

var e = new lx.Box({
	geom: [10, 10, 10, 10]
});
e.fill('red');
e.click(function() {

	Plugin.environment._connector.socket.break();
	// Plugin.environment._connector.socket.close();

});
