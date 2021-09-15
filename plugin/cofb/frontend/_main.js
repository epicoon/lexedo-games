/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Box} Snippet
 */

#lx:use lexedo.games;

Plugin.environment = new lexedo.games.Environment(Plugin, {
	mode: 'dev',
	name: 'Cofb',
	game: {
		class: 'lexedo.games.Cofb.Game',
		local: {module: 'lexedo.games.CofbLocal'},
		online: {
			module: 'lexedo.games.CofbOnline',
			channelEventListener: 'lexedo.games.Cofb.ChannelEventListener'
		}
	}
});













// lx.on('keydown', function() {
// 	Plugin->floatPoints.start(['rthrthrt ergegre ytyj']);
// });




// var sphereGeometry = new THREE.SphereGeometry(40, cofb.fisSMOOTH, cofb.fisSMOOTH);
// var sphereMaterial = new THREE.MeshBasicMaterial({ map: Game.world.getTexture('sun') });

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





// var Game = Plugin.environment.getGame();

// // имитация начала игры
// Game.start([
// 	{num:0, seg:1, ai:false},
// 	{num:1, seg:2, ai:false}
// ]);


// // имитация старта фазы
// var f = Game.field,
// 	l = f.tyles['st1'];
// for (var i=1; i<6; i++) {
// 	var tn = f.tyles['tn' + i],
// 		ch = l.chips[0];
// 	ch.turn();
// 	tn.locate(ch);
// }
// Game.nextPhase();


// // Game.gamers['g1'].plan.tyles['advWait0'].locate( bgPacks.brown.getOne().genChip() );
// var info = new bgChipInfo( GROUPE_BUILDING, VARIANT_BUILDING_TRADEPOST, bgPacks.brown );
// Game.gamers['g1'].plan.tyles['advWait0'].locate( info.genChip() );
// Game.gamers['g1'].cubes[0].applyValue(3);	

// Game.gamers['g1'].plan.tyles['goods0'].delChips();
// Game.gamers['g1'].plan.tyles['goods1'].delChips();
// Game.gamers['g1'].plan.tyles['goods2'].delChips();

// // имитация старта раунда
// // var cubes = [ Game.cube ];
// // for (var i in Game.gamers) {
// // 	cubes.push( Game.gamers[i].cubes[0] );
// // 	cubes.push( Game.gamers[i].cubes[1] );
// // }
// // for (var i in cubes) cubes[i].genRandom();
// f.tyles['goods2'].locate( f.tyles['tn1'].chips[0] );
// Game.turnsBegin();
// Game.status.setPending();

