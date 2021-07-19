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
