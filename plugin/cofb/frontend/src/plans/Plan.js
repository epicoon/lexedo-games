#lx:macros Const {lexedo.games.Cofb.Constants};

#lx:private;

//TODO data-provider
var PLAN_CUBE_MAP = [6, 5, 4, 3, 2, 1, 6, 5, 4, 5, 4, 3, 1, 2, 3, 6, 1, 2, 6, 5, 4, 1, 2, 5, 4, 3, 1, 2, 6, 1, 2, 5, 6, 3, 4, 1, 3];
var PLAN_GROUPE_MAP = [
	[>>>Const.GROUPE_ANIMAL, >>>Const.GROUPE_CASTLE, >>>Const.GROUPE_CASTLE, >>>Const.GROUPE_KNOWLEGE, >>>Const.GROUPE_ANIMAL, >>>Const.GROUPE_ANIMAL, >>>Const.GROUPE_CASTLE, >>>Const.GROUPE_KNOWLEGE, >>>Const.GROUPE_BUILDING,
	>>>Const.GROUPE_ANIMAL, >>>Const.GROUPE_ANIMAL, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_KNOWLEGE, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_BUILDING,
	>>>Const.GROUPE_SHIP, >>>Const.GROUPE_SHIP, >>>Const.GROUPE_SHIP, >>>Const.GROUPE_CASTLE, >>>Const.GROUPE_SHIP, >>>Const.GROUPE_SHIP, >>>Const.GROUPE_SHIP,
	>>>Const.GROUPE_BUILDING, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_MINE, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_ANIMAL,
	>>>Const.GROUPE_BUILDING, >>>Const.GROUPE_MINE, >>>Const.GROUPE_KNOWLEGE, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_BUILDING, >>>Const.GROUPE_MINE, >>>Const.GROUPE_KNOWLEGE, >>>Const.GROUPE_KNOWLEGE, >>>Const.GROUPE_BUILDING]
];


class Plan #lx:namespace lexedo.games.Cofb {
	constructor(gamer, type) {
		this.mesh = null;
		this.gamer = gamer;
		this.type = type;
		this.name = 'field.' + gamer.id + '.' + type;
		this.tyles = [];
		__create(this);
	}
	
	getGame() {
		return this.gamer.game;
	}

	setPosition(x, y, z) {
		if (y === undefined) { y = x[1]; z = x[2]; x = x[0]; }

		var newPos = new THREE.Vector3(x, y, z),
			shift = new THREE.Vector3();

		shift.subVectors(newPos, this.mesh.position);

		this.mesh.position.copy(newPos);

		for (var i in this.tyles) {
			var l = this.tyles[i];
			for (var j in l.chips) {
				var ch = l.chips[j];
				ch.mesh.position.add(shift);
			}
		}
	}

	surface() {
		return this.mesh.position.y + this.sizes[1] * 0.5;
	}

	advLocNeiborNums(num) {
		num = +num;
		var amt = [4, 5, 6, 7, 6, 5, 4],
			lims = [ [0, 3], [4, 8], [9, 14], [15, 21], [22, 27], [28, 32], [33, 36] ],
			row, test,
			arr = [];

		for (var i in lims)
			if ( num >= lims[i][0] && num <= lims[i][1] ) { row = +i; break; }

		test = num - 1;
		if ( test >= lims[row][0] && test <= lims[row][1] ) arr.push( test );

		test = num + 1;
		if ( test >= lims[row][0] && test <= lims[row][1] ) arr.push( test );

		if (row > 0) {
			test = num - amt[row];
			if ( test >= lims[row - 1][0] && test <= lims[row - 1][1] ) arr.push( test );
			test = num - amt[row - 1];
			if ( test >= lims[row - 1][0] && test <= lims[row - 1][1] ) arr.push( test );
		}

		if (row < 6) {
			test = num + amt[row];
			if ( test >= lims[row + 1][0] && test <= lims[row + 1][1] ) arr.push( test );
			test = num + amt[row + 1];
			if ( test >= lims[row + 1][0] && test <= lims[row + 1][1] ) arr.push( test );
		}

		return arr;
	}

	advLocNeibor(loc) {
		var num, tyle;
		if (lx.isNumber(loc)) {
			num = +loc;
			tyle = this.tyles['advLoc' + num];
		} else if ( loc.substr !== undefined && loc.substr(0, 6) == 'advLoc' ) {
			num = +loc.split('c')[1];
			tyle = this.tyles[loc];
		} else if ( loc.filledHeight !== undefined && loc.name.substr(0, 6) == 'advLoc' ) {
			tyle = loc;
			num = +loc.name.split('c')[1];
		} else return [];

		var nums = this.advLocNeiborNums(num),
			arr = [];

		for (var i in nums) {
			arr.push( this.tyles['advLoc' + nums[i]] );
		}

		return arr;
	}

	areaNums(num) {
		num = +num;
		var arr = [],
			ctx = this;

		function rec(num) {
			var index = arr.indexOf(num);
			if (index != -1) return;

			arr.push(num);

			var neib = ctx.advLocNeiborNums(num);
			for (var i in neib) {
				if ( ctx.tyles['advLoc' + neib[i]].groupe == ctx.tyles['advLoc' + num].groupe )
					rec( neib[i] );
			}
		}

		rec(num);

		return arr;		
	}

	area(loc) {
		var num, tyle;
		if (lx.isNumber(loc)) {
			num = +loc;
			tyle = this.tyles['advLoc' + num];
		} else if ( loc.substr !== undefined && loc.substr(0, 6) == 'advLoc' ) {
			num = +loc.split('c')[1];
			tyle = this.tyles[loc];
		} else if ( loc.filledHeight !== undefined && loc.name.substr(0, 6) == 'advLoc' ) {
			tyle = loc;
			num = +loc.name.split('c')[1];
		} else return [];

		var arr = [];

		var nums = this.areaNums(num);
		for (var i in nums) arr.push( this.tyles['advLoc' + nums[i]] );

		return arr;
	}
}

function __create(self) {
	// Сам планшет
	var fileName = 'plan';
	if (self.type + 1 < 10) fileName += '0';
	fileName += (self.type + 1);
	var t1 = self.getGame().world.getTexture( fileName ),
		t2 = self.getGame().world.getTexture( >>>Const.GAMER_COLOR[ self.gamer.id ] );
	var material = [
		new THREE.MeshLambertMaterial({ map: t1 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t2 })
	];
	var w = >>>Const.FIELD_SIZE * 0.7, h = 5, d = w * 0.723;
	self.mesh = self.getGame().world.newMesh({
		geometry: new lx3dGeometry.cutBox(w, h, d, [0, 0, 0, 0], >>>Const.fisSMOOTH),
		material,
		clickable: true
	});
	self.mesh.name = self.name;
	self.sizes = [w, h, d];
	self.getGame().world.registerStaff(self);

	// ожидающие улучшения
	__addTyle(self, 'advWait0', -0.215, 0.195, { type : >>>Const.TYLE_ADVANTAGE_WAITING });
	__addTyle(self, 'advWait1', -0.145, 0.195, { type : >>>Const.TYLE_ADVANTAGE_WAITING });
	__addTyle(self, 'advWait2', -0.075, 0.195, { type : >>>Const.TYLE_ADVANTAGE_WAITING });

	// размещенные улучшения
	var amt = 4,
		baseX = 0.00125,
		baseZ = -0.1625,
		tabX = -0.03125,
		tabZ = 0.056,
		stepX = 0.063125,
		inc = 1,
		counter = 0;
	for (var i=0; i<7; i++) {
		for (var j=0; j<amt; j++) {
			__addTyle(self, 'advLoc' + counter, baseX + stepX * j, baseZ, { type : >>>Const.TYLE_ADVANTAGE_LOCATED, cube : 0, groupe : 0 });
			counter++;
		}
		if (amt == 7) inc = -1;
		amt += inc;
		baseX += tabX * inc;
		baseZ += tabZ;
	}
	for (var i=0; i<37; i++) {
		var tyle = self.tyles['advLoc' + i];
		tyle.cube = PLAN_CUBE_MAP[i];
		tyle.groupe = PLAN_GROUPE_MAP[self.type][i];
	}

	// товары для продажи
	__addTyle(self, 'goods0', -0.2275, -0.2025, { type : >>>Const.TYLE_GOODS_INGAMER, cube : 0 });
	__addTyle(self, 'goods1', -0.2275, -0.135, { type : >>>Const.TYLE_GOODS_INGAMER, cube : 0 });
	__addTyle(self, 'goods2', -0.16, -0.135, { type : >>>Const.TYLE_GOODS_INGAMER, cube : 0 });

	// товары проданные
	__addTyle(self, 'goods', -0.16, -0.2025, { type : >>>Const.TYLE_GOODS_SALES });

	// серебро
	__addTyle(self, 'silver', -0.3, -0.1675, { type : >>>Const.TYLE_SILVER });

	// рабочие
	__addTyle(self, 'worker', -0.2975, 0.195, { type : >>>Const.TYLE_WORKER });

	// кубики
	__addTyle(self, 'cube0', 0.0775, -0.225, { type : >>>Const.TYLE_CUBE_GAMER });
	__addTyle(self, 'cube1', 0.1175, -0.225, { type : >>>Const.TYLE_CUBE_GAMER });
	__addTyle(self, 'cubeJoker', 0.0375, -0.225, { type : >>>Const.TYLE_CUBE_GAMER });
	__addTyle(self, 'cubeRest', 0.2925, -0.1875, { type : >>>Const.TYLE_CUBE_GAMER });

	// бонус
	__addTyle(self, 'bonus', 0.3125, -0.1125, { type : >>>Const.TYLE_BONUS_INGAMER });
	
	// счетчики +100
	__addTyle(self, 'point100', -0.035, -0.22, { type : >>>Const.TYLE_COUNTER });
}

function __addTyle(self, name, x, y, info) {
	var tyle = new lexedo.games.Cofb.Tyle(name, x, y, self);
	self.tyles[name] = tyle;
	for (var i in info) tyle[i] = info[i];
}
