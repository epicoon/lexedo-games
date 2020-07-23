/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

#lx:require -R src/;


/*
* завершение фазы питания, вымирание, новый ход (новая сдача карт, смена последовательности)
	- размер сброса каждого игрока важен
	- порядок хода меняется на следующий ход
* флаг последнего хода
* завершение игры, подсчет очков

* рестарт игры

* реализация свойств
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

//TODO
window.ev = Plugin.environment;
