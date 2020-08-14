/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lexedo.games;

#lx:require -R src/;


/*
* реализация активности свойств
	+ топотун
	- спячка
	- пиратство
	- жировой запас
	- взаимодействие
	- сотрудничество

	- хищничество
		- симбиоз, большой, плавание, норное, камуфляж
		- острое зрение
		- ядовитое
		- падальщик
		- отбрасывание хвоста, быстрый, мимикрия

* сохранение/загрузка
* игровой лог
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
window.ev.dump = function(str) {
	Plugin.environment.getSocket().dump(str);
};
