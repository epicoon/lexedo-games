/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

const menuBox = Snippet.widget;
const butM2 = menuBox->>m2;
const butM1 = menuBox->>m1;
const butP2 = menuBox->>p2;
const butP1 = menuBox->>p1;
const butAdd = menuBox->>add;

menuBox.open = function() {
	butM2.show();
	butM1.show();
	butP1.show();
	butP2.show();

	var game = Plugin.environment.getGame(),
		gamer = game.gamer();
	if ( !gamer.plan.tyles['worker'].chips.length ) {
		butM2.hide();
		butM1.hide();
		butP1.hide();
		butP2.hide();
	}
	if ( !gamer.knows('k8') ) {
		butM2.hide();
		butP2.hide();
	}

	var bonus = '';
	var text = 'Обменять кубик на двух рабочих';

	var gamer = game.gamer();
	if ( gamer.knows('k14') ) bonus = 'два рабочих';
	if ( gamer.knows('k13') ) {
		if (bonus == '') bonus = 'слиток серебра';
		else bonus += ', слиток серебра';
	}
	if (bonus != '') text += '. Ваш бонус: еще ' + bonus + '.';

	this->>add.text(text);

	this.show();
};

menuBox->back.click(()=>menuBox.hide());
butM2.click(()=>__incCube(-2));
butM1.click(()=>__incCube(-1));
butP1.click(()=>__incCube( 1));
butP2.click(()=>__incCube( 2));
butAdd.click(()=>__changeCubeToWorker());

function __incCube(val) {
	menuBox.hide();

	let game = Plugin.environment.getGame();
	game.gamer().plan.tyles['worker'].delChips(1);
	game.activeCube.incValue(val);
	game.world.clearSpiritStaff();
	game.triggerLocalEvent('cofb_active_cube_changed', game.activeCube.value);
}

function __changeCubeToWorker() {
	menuBox.hide();
	Plugin.environment.getGame().gamer().changeCubeToWorker();
}
