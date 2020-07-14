/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

#lx:require -R src/;


/*
* доделать свойства
* подсветка существ
* процесс кормления
* переход хода в фазе питания
* флаг последнего хода
* завершение игры, подсчет очков
* рестарт игры

* реализация свойств

- порядок хода меняется на следующий ход
- размер сброса каждого игрока важен
- какая сейчас фаза
	развития
		наступает после сдачи карт (начало игры, или новый ход)
	определения кормовой базы (как событие должно происходить в фоне, выводить инфу)
		наступает, когда все игроки пасанули
	питания
		наступает, когда определилась кормовая база (автоматически)
	вымирания (и получения новых карт) (как событие должно происходить в фоне, выводить инфу)
		наступает, когда:
			все существа накормлены
			ИЛИ
			еды не осталось и все игроки применили свойства, которые хотели
*/


Plugin.environment = new lexedo.games.Environment(Plugin, {
	mode: 'dev',
	name: 'Evolution',

	//TODO
	useScreenLock: false,

	game: {
		class: 'lexedo.games.Evolution.Game',
		channelEventListener: 'lexedo.games.Evolution.EventListener',
		connectionEventListener: 'lexedo.games.Evolution.ConnectionEventListener'
	}
});

//TODO
window.ev = Plugin.environment;
