/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

Plugin.environment = new lexedo.games.Environment(Plugin, {
	mode: 'dev',
	name: 'Chess',
	game: {
		class: 'lexedo.games.Chess.Game',
		local: {module: 'lexedo.games.ChessLocal'},
		online: {
			module: 'lexedo.games.ChessOnline',
			channelEventListener: 'lexedo.games.Chess.EventListener'
		}
	}
});
