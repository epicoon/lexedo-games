/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

#lx:require -R src/;

Plugin.root.overflow('hidden');

Plugin.environment = new lexedo.games.Environment(Plugin, {
	mode: 'dev',
	name: 'Evolution',
	game: {
		class: 'lexedo.games.Evolution.Game',
		channelEventListener: 'lexedo.games.Evolution.ChannelEventListener'
	}
});


/*

model-update --level=mediator

model-update --level=gen-migration

model-update --level=run-migration


*/