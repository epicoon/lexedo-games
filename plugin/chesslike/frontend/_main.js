/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

Plugin.environment = new lexedo.games.Environment(Plugin, {
	mode: 'dev',
	name: 'Chess',
	game: {
		local: {module: 'lexedo.games.ChessLocal'},
		online: {module: 'lexedo.games.ChessOnline'},
		class: 'lexedo.games.Chess.Game',
		channelEventListener: 'lexedo.games.Chess.EventListener'
	}
});
