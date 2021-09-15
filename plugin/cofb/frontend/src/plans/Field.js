#lx:macros Const {lexedo.games.Cofb.Constants};

#lx:private;

class Field #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		this.game = game;
		this.mesh = null;
		this.name = 'field';
		this.tyles = [];
		__create(this);
	}

	surface() {
		return this.mesh.position.y + this.sizes[1] * 0.5;
	}

	clear() {
		for (var i in this.tyles) {
			if (i == 'cube') continue;
			this.tyles[i].delChips();
		}
	}
}

function __create(self) {
	var t1 = self.game.world.getTexture( 'field' ),
		t2 = self.game.world.getTexture( 'brownSide' );

	var material = [
		new THREE.MeshLambertMaterial({ map: t1 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 })
	];

	var w = >>>Const.FIELD_SIZE, h = 5, d = w * 0.723;

	self.mesh = self.game.world.newMesh({
		geometry: new lx3dGeometry.cutBox(w, h, d, [0, 0, 0, 0], >>>Const.fisSMOOTH),
		material,
		clickable: true
	});
	self.mesh.name = 'field';

	self.sizes = [w, h, d];

	self.game.world.registerStaff(self);

	// для размещения товаров по стадиям игры
	__addTyle(self, 'st1', -0.4025, -0.265, { type : >>>Const.TYLE_GOODS_STAGE });
	__addTyle(self, 'st2', -0.3325, -0.265, { type : >>>Const.TYLE_GOODS_STAGE });
	__addTyle(self, 'st3', -0.265, -0.265, { type : >>>Const.TYLE_GOODS_STAGE });
	__addTyle(self, 'st4', -0.1975, -0.265, { type : >>>Const.TYLE_GOODS_STAGE });
	__addTyle(self, 'st5', -0.1275, -0.265, { type : >>>Const.TYLE_GOODS_STAGE });

	// для размещения товаров по раундам стадии
	__addTyle(self, 'tn1', -0.4025, -0.165, { type : >>>Const.TYLE_GOODS_TURN });
	__addTyle(self, 'tn2', -0.4025, -0.1, { type : >>>Const.TYLE_GOODS_TURN });
	__addTyle(self, 'tn3', -0.4025, -0.03, { type : >>>Const.TYLE_GOODS_TURN });
	__addTyle(self, 'tn4', -0.4025, 0.0375, { type : >>>Const.TYLE_GOODS_TURN });
	__addTyle(self, 'tn5', -0.4025, 0.105, { type : >>>Const.TYLE_GOODS_TURN });

	// для размещения товаров в ожидание
	__addTyle(self, 'goods1', 0.0625, -0.1675, { type : >>>Const.TYLE_GOODS_INGAME, cube : 1 });
	__addTyle(self, 'goods2', 0.2375, -0.0875, { type : >>>Const.TYLE_GOODS_INGAME, cube : 2 });
	__addTyle(self, 'goods3', 0.2375, 0.0875, { type : >>>Const.TYLE_GOODS_INGAME, cube : 3 });
	__addTyle(self, 'goods4', 0.0625, 0.1675, { type : >>>Const.TYLE_GOODS_INGAME, cube : 4 });
	__addTyle(self, 'goods5', -0.1125, 0.0875, { type : >>>Const.TYLE_GOODS_INGAME, cube : 5 });
	__addTyle(self, 'goods6', -0.1125, -0.0875, { type : >>>Const.TYLE_GOODS_INGAME, cube : 6 });

	// улучшения на кубиках
	__addTyle(self, 'advCube12' + >>>Const.GROUPE_BUILDING, 0.03, -0.27, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 1, amt : 2, groupe : >>>Const.GROUPE_BUILDING });
	__addTyle(self, 'advCube12' + >>>Const.GROUPE_SHIP, 0.0975, -0.27, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 1, amt : 2, groupe : >>>Const.GROUPE_SHIP });
	__addTyle(self, 'advCube13' + >>>Const.GROUPE_KNOWLEGE, -0.0375, -0.27, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 1, amt : 3, groupe : >>>Const.GROUPE_KNOWLEGE });
	__addTyle(self, 'advCube14' + >>>Const.GROUPE_ANIMAL, 0.1625, -0.27, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 1, amt : 4, groupe : >>>Const.GROUPE_ANIMAL });

	__addTyle(self, 'advCube22' + >>>Const.GROUPE_KNOWLEGE, 0.3375, -0.1275, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 2, amt : 2, groupe : >>>Const.GROUPE_KNOWLEGE });
	__addTyle(self, 'advCube22' + >>>Const.GROUPE_CASTLE, 0.3375, -0.0525, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 2, amt : 2, groupe : >>>Const.GROUPE_CASTLE });
	__addTyle(self, 'advCube23' + >>>Const.GROUPE_BUILDING, 0.4025, -0.1275, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 2, amt : 3, groupe : >>>Const.GROUPE_BUILDING });
	__addTyle(self, 'advCube24' + >>>Const.GROUPE_BUILDING, 0.4025, -0.0525, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 2, amt : 4, groupe : >>>Const.GROUPE_BUILDING });

	__addTyle(self, 'advCube32' + >>>Const.GROUPE_ANIMAL, 0.3375, 0.05, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 3, amt : 2, groupe : >>>Const.GROUPE_ANIMAL });
	__addTyle(self, 'advCube32' + >>>Const.GROUPE_BUILDING, 0.3375, 0.125, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 3, amt : 2, groupe : >>>Const.GROUPE_BUILDING });
	__addTyle(self, 'advCube33' + >>>Const.GROUPE_SHIP, 0.4025, 0.05, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 3, amt : 3, groupe : >>>Const.GROUPE_SHIP });
	__addTyle(self, 'advCube34' + >>>Const.GROUPE_KNOWLEGE, 0.4025, 0.125, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 3, amt : 4, groupe : >>>Const.GROUPE_KNOWLEGE });

	__addTyle(self, 'advCube42' + >>>Const.GROUPE_SHIP, 0.03, 0.2675, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 4, amt : 2, groupe : >>>Const.GROUPE_SHIP });
	__addTyle(self, 'advCube42' + >>>Const.GROUPE_BUILDING, 0.0975, 0.2675, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 4, amt : 2, groupe : >>>Const.GROUPE_BUILDING });
	__addTyle(self, 'advCube43' + >>>Const.GROUPE_ANIMAL, 0.1625, 0.2675, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 4, amt : 3, groupe : >>>Const.GROUPE_ANIMAL });
	__addTyle(self, 'advCube44' + >>>Const.GROUPE_MINE, -0.0375, 0.2675, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 4, amt : 4, groupe : >>>Const.GROUPE_MINE });

	__addTyle(self, 'advCube52' + >>>Const.GROUPE_MINE, -0.21, 0.05, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 5, amt : 2, groupe : >>>Const.GROUPE_MINE });
	__addTyle(self, 'advCube52' + >>>Const.GROUPE_KNOWLEGE, -0.21, 0.125, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 5, amt : 2, groupe : >>>Const.GROUPE_KNOWLEGE });
	__addTyle(self, 'advCube53' + >>>Const.GROUPE_BUILDING, -0.275, 0.05, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 5, amt : 3, groupe : >>>Const.GROUPE_BUILDING });
	__addTyle(self, 'advCube54' + >>>Const.GROUPE_BUILDING, -0.275, 0.125, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 5, amt : 4, groupe : >>>Const.GROUPE_BUILDING });

	__addTyle(self, 'advCube62' + >>>Const.GROUPE_BUILDING, -0.21, -0.1275, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 6, amt : 2, groupe : >>>Const.GROUPE_BUILDING });
	__addTyle(self, 'advCube62' + >>>Const.GROUPE_ANIMAL, -0.21, -0.0525, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 6, amt : 2, groupe : >>>Const.GROUPE_ANIMAL });
	__addTyle(self, 'advCube63' + >>>Const.GROUPE_CASTLE, -0.275, -0.1275, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 6, amt : 3, groupe : >>>Const.GROUPE_CASTLE, groupe2 : >>>Const.GROUPE_MINE });
	__addTyle(self, 'advCube64' + >>>Const.GROUPE_SHIP, -0.275, -0.0525, { type : >>>Const.TYLE_ADVANTAGE_CUBE, cube : 6, amt : 4, groupe : >>>Const.GROUPE_SHIP });

	// улучшения продающиеся
	__addTyle(self, 'advSell12', 0.0625, -0.0575, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 2 });
	__addTyle(self, 'advSell22', 0.03, 0, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 2 });
	__addTyle(self, 'advSell32', 0.095, 0, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 2 });
	__addTyle(self, 'advSell42', 0.0625, 0.055, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 2 });
	__addTyle(self, 'advSell53', -0.0025, -0.0575, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 3 });
	__addTyle(self, 'advSell63', 0.1275, 0.055, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 3 });
	__addTyle(self, 'advSell74', -0.0025, 0.055, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 4 });
	__addTyle(self, 'advSell84', 0.1275, -0.0575, { type : >>>Const.TYLE_ADVANTAGE_FORSALE, amt : 4 });

	// бонусы большие
	__addTyle(self, 'bmax1', 0.255, -0.28, { type : >>>Const.TYLE_BONUS_INGAME, max : true });
	__addTyle(self, 'bmax5', 0.33, -0.28, { type : >>>Const.TYLE_BONUS_INGAME, max : true });
	__addTyle(self, 'bmax0', 0.4075, -0.28, { type : >>>Const.TYLE_BONUS_INGAME, max : true });
	__addTyle(self, 'bmax4', 0.255, 0.275, { type : >>>Const.TYLE_BONUS_INGAME, max : true });
	__addTyle(self, 'bmax2', 0.33, 0.275, { type : >>>Const.TYLE_BONUS_INGAME, max : true });
	__addTyle(self, 'bmax3', 0.4075, 0.275, { type : >>>Const.TYLE_BONUS_INGAME, max : true });

	// бонусы маленькие
	__addTyle(self, 'bmin1', 0.255, -0.22, { type : >>>Const.TYLE_BONUS_INGAME, max : false });
	__addTyle(self, 'bmin5', 0.3325, -0.22, { type : >>>Const.TYLE_BONUS_INGAME, max : false });
	__addTyle(self, 'bmin0', 0.4075, -0.22, { type : >>>Const.TYLE_BONUS_INGAME, max : false });
	__addTyle(self, 'bmin4', 0.255, 0.2125, { type : >>>Const.TYLE_BONUS_INGAME, max : false });
	__addTyle(self, 'bmin2', 0.3325, 0.2125, { type : >>>Const.TYLE_BONUS_INGAME, max : false });
	__addTyle(self, 'bmin3', 0.4075, 0.2125, { type : >>>Const.TYLE_BONUS_INGAME, max : false });

	// порядок ходов
	__addTyle(self, 'seq0', -0.41, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 0 });
	__addTyle(self, 'seq1', -0.36375, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 1 });
	__addTyle(self, 'seq2', -0.3175, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 2 });
	__addTyle(self, 'seq3', -0.27125, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 3 });
	__addTyle(self, 'seq4', -0.225, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 4 });
	__addTyle(self, 'seq5', -0.17875, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 5 });
	__addTyle(self, 'seq6', -0.1325, 0.2075, { type : >>>Const.TYLE_GAMER_SEQUENCE, pos : 6 });

	// шкала очков
	__addTyle(self, 'point0', -0.4675, 0.3, { type : >>>Const.TYLE_GAMER_POINTS, pos : 0 });
	var step = -0.03375,
		current = 0.235,
		point = 1;
	for (var i=0; i<18; i++) {
		__addTyle(self, 'point' + point, -0.4675, current, { type : >>>Const.TYLE_GAMER_POINTS, pos : point });
		current += step;
		point++;
	}
	step = 0.034725, current = -0.432775;
	for (var i=0; i<27; i++) {
		__addTyle(self, 'point' + point, current, -0.33875, { type : >>>Const.TYLE_GAMER_POINTS, pos : point });
		current += step;
		point++;
	}
	step = 0.03375, current = -0.305;
	for (var i=0; i<20; i++) {
		__addTyle(self, 'point' + point, 0.47, current, { type : >>>Const.TYLE_GAMER_POINTS, pos : point });
		current += step;
		point++;
	}
	step = -0.034725, current = 0.435275;
	for (var i=0; i<19; i++) {
		__addTyle(self, 'point' + point, current, 0.33875, { type : >>>Const.TYLE_GAMER_POINTS, pos : point });
		current += step;
		point++;
	}
	__addTyle(self, 'point85', -0.189775, 0.3025, { type : >>>Const.TYLE_GAMER_POINTS, pos : 85 });
	__addTyle(self, 'point86', -0.189775, 0.26875, { type : >>>Const.TYLE_GAMER_POINTS, pos : 86 });
	__addTyle(self, 'point87', -0.2245, 0.26875, { type : >>>Const.TYLE_GAMER_POINTS, pos : 87 });
	__addTyle(self, 'point88', -0.259225, 0.26875, { type : >>>Const.TYLE_GAMER_POINTS, pos : 88 });
	__addTyle(self, 'point89', -0.259225, 0.3025, { type : >>>Const.TYLE_GAMER_POINTS, pos : 89 });
	__addTyle(self, 'point90', -0.259225, 0.33625, { type : >>>Const.TYLE_GAMER_POINTS, pos : 90 });
	__addTyle(self, 'point91', -0.29395, 0.33625, { type : >>>Const.TYLE_GAMER_POINTS, pos : 91 });
	__addTyle(self, 'point92', -0.328675, 0.33625, { type : >>>Const.TYLE_GAMER_POINTS, pos : 92 });
	__addTyle(self, 'point93', -0.328675, 0.3025, { type : >>>Const.TYLE_GAMER_POINTS, pos : 93 });
	__addTyle(self, 'point94', -0.328675, 0.26875, { type : >>>Const.TYLE_GAMER_POINTS, pos : 94 });
	__addTyle(self, 'point95', -0.3634, 0.26875, { type : >>>Const.TYLE_GAMER_POINTS, pos : 95 });
	__addTyle(self, 'point96', -0.398125, 0.26875, { type : >>>Const.TYLE_GAMER_POINTS, pos : 96 });
	__addTyle(self, 'point97', -0.398125, 0.3025, { type : >>>Const.TYLE_GAMER_POINTS, pos : 97 });
	__addTyle(self, 'point98', -0.398125, 0.33625, { type : >>>Const.TYLE_GAMER_POINTS, pos : 98 });
	__addTyle(self, 'point99', -0.43285, 0.33625, { type : >>>Const.TYLE_GAMER_POINTS, pos : 99 });

	// кубик
	__addTyle(self, 'cube', -0.125, 0.275, { type : >>>Const.TYLE_CUBE_GAME });
}

function __addTyle(self, name, x, y, info) {
	var tyle = new lexedo.games.Cofb.Tyle(name, x, y, self);
	self.tyles[name] = tyle;
	tyle.lxMerge(info);
}
