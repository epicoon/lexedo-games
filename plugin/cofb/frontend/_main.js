/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Box} Snippet
 */

// Отключение дефолтного контекстного меню
// document.oncontextmenu = function() { return false; };

// Локальное пространство имен для классов плагина
const cofb ={
	FIELD_SIZE: 400,
	fisSMOOTH: 32,
	GAMER_NAMES: ['зеленый', 'синий', 'красный', 'черный'],
	GAMER_COLOR: ['darkgreenSide', 'blueSide', 'redSide', 'blackSide']
};
cofb.EventSupervisor = new lx.LocalEventSupervisor();
/*
События:
	- cofb_status_changed
	- cofb_gamer_activated
	- cofb_chip_clicked
	- cofb_active_cube_changed
	- cofb_gamer_move_ends
	- cofb_game_over
*/


#lx:require components/Status;
cofb.status = new cofb.Status();


#lx:require @site/lib/Math3d.js;
#lx:require -R @site/lib/lx3d/;
#lx:require components/World;
cofb.world = new cofb.World({
	canvas : Plugin->canvas,
	lights : [ 0x000000, 0x777777, 0xffffff ],
	cameraPosition : {x:0, y:1033, z:1033},
	cameraConfig: {
		watchForObjects: false,
		followMouse: false,
		speed: 0.5,
		scrollSpeed: 10,
		limits: {
			x: [-700, 700],
			y: [500, 4000],
			z: [500, 4000]
		}
	}
});
cofb.world.createTable();


#lx:require game;
bgGame.baseInit();
bgGame.prepareField();
bgGame.preparePacks();
Plugin->lblHint.text('Начните новую игру');
















// lx.on('keydown', function() {
// 	Plugin->floatPoints.start(['rthrthrt ergegre ytyj']);
// });




// var sphereGeometry = new THREE.SphereGeometry(40, cofb.fisSMOOTH, cofb.fisSMOOTH);
// var sphereMaterial = new THREE.MeshBasicMaterial({ map: cofb.world.getTexture('sun') });

// sphereMaterial.opacity = 0.5;
// sphereMaterial.transparent = true;

// var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// bgSpace.scene.add( sphere );

// sphere.position.y = 40;

// var geometry = new THREE.CylinderGeometry(20, 30, 50, cofb.fisSMOOTH);
// var material = new THREE.MeshBasicMaterial({ color: 0xff7777 });

// material.opacity = 0.7;
// material.transparent = true;

// var cylinder = new THREE.Mesh(geometry, material);
// bgSpace.scene.add( cylinder );

// cylinder.position.y = 40;






// // имитация начала игры
// bgGame.start([
// 	{num:0, seg:1, ai:false},
// 	{num:1, seg:2, ai:false}
// ]);


// // имитация старта фазы
// var f = bgGame.field,
// 	l = f.locus['st1'];
// for (var i=1; i<6; i++) {
// 	var tn = f.locus['tn' + i],
// 		ch = l.chips[0];
// 	ch.turn();
// 	tn.locate(ch);
// }
// bgGame.nextPhase();


// // bgGame.gamers['g1'].plan.locus['advWait0'].locate( bgPacks.brown.getOne().genChip() );
// var info = new bgChipInfo( GROUPE_BUILDING, VARIANT_BUILDING_TRADEPOST, bgPacks.brown );
// bgGame.gamers['g1'].plan.locus['advWait0'].locate( info.genChip() );
// bgGame.gamers['g1'].cubes[0].applyValue(3);	

// bgGame.gamers['g1'].plan.locus['goods0'].delChips();
// bgGame.gamers['g1'].plan.locus['goods1'].delChips();
// bgGame.gamers['g1'].plan.locus['goods2'].delChips();

// // имитация старта раунда
// // var cubes = [ bgGame.cube ];
// // for (var i in bgGame.gamers) {
// // 	cubes.push( bgGame.gamers[i].cubes[0] );
// // 	cubes.push( bgGame.gamers[i].cubes[1] );
// // }
// // for (var i in cubes) cubes[i].genRandom();
// f.locus['goods2'].locate( f.locus['tn1'].chips[0] );
// bgGame.turnsBegin();
// cofb.status.set(cofb.Status.PENDING);

