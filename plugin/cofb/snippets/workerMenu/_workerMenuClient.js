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

	var gamer = bgGame.gamer();
	if ( !gamer.plan.locus['worker'].chips.length ) {
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

	//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	var gamer = bgGame.gamer();
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

	//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	bgGame.gamer().plan.locus['worker'].delChips(1);
	bgGame.activeCube.incValue(val);
	cofb.world.clearSpiritStaff();
	cofb.EventSupervisor.trigger('cofb_active_cube_changed', bgGame.activeCube.value);
}

function __changeCubeToWorker() {
	menuBox.hide();

	//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	bgGame.gamer().changeCubeToWorker();
}
