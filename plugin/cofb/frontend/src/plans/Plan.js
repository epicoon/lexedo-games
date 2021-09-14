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
		this.locus = [];
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

		for (var i in this.locus) {
			var l = this.locus[i];
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
		var num, locus;
		if (loc.isNumber) {
			num = +loc;
			locus = this.locus['advLoc' + num];
		} else if ( loc.substr !== undefined && loc.substr(0, 6) == 'advLoc' ) {
			num = +loc.split('c')[1];
			locus = this.locus[loc];
		} else if ( loc.filledHeight !== undefined && loc.name.substr(0, 6) == 'advLoc' ) {
			locus = loc;
			num = +loc.name.split('c')[1];
		} else return [];

		var nums = this.advLocNeiborNums(num),
			arr = [];

		for (var i in nums) {
			arr.push( this.locus['advLoc' + nums[i]] );
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
				if ( ctx.locus['advLoc' + neib[i]].groupe == ctx.locus['advLoc' + num].groupe )
					rec( neib[i] );
			}
		}

		rec(num);

		return arr;		
	}

	area(loc) {
		var num, locus;
		if (loc.isNumber) {
			num = +loc;
			locus = this.locus['advLoc' + num];
		} else if ( loc.substr !== undefined && loc.substr(0, 6) == 'advLoc' ) {
			num = +loc.split('c')[1];
			locus = this.locus[loc];
		} else if ( loc.filledHeight !== undefined && loc.name.substr(0, 6) == 'advLoc' ) {
			locus = loc;
			num = +loc.name.split('c')[1];
		} else return [];

		var arr = [];

		var nums = this.areaNums(num);
		for (var i in nums) arr.push( this.locus['advLoc' + nums[i]] );

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
	__addLocus(self, 'advWait0', -0.215, 0.195, { type : >>>Const.LOCUS_ADVANTAGE_WAITING });
	__addLocus(self, 'advWait1', -0.145, 0.195, { type : >>>Const.LOCUS_ADVANTAGE_WAITING });
	__addLocus(self, 'advWait2', -0.075, 0.195, { type : >>>Const.LOCUS_ADVANTAGE_WAITING });

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
			__addLocus(self, 'advLoc' + counter, baseX + stepX * j, baseZ, { type : >>>Const.LOCUS_ADVANTAGE_LOCATED, cube : 0, groupe : 0 });
			counter++;
		}
		if (amt == 7) inc = -1;
		amt += inc;
		baseX += tabX * inc;
		baseZ += tabZ;
	}
	for (var i=0; i<37; i++) {
		var locus = self.locus['advLoc' + i];
		locus.cube = PLAN_CUBE_MAP[i];
		locus.groupe = PLAN_GROUPE_MAP[self.type][i];
	}

	// товары для продажи
	__addLocus(self, 'goods0', -0.2275, -0.2025, { type : >>>Const.LOCUS_GOODS_INGAMER, cube : 0 });
	__addLocus(self, 'goods1', -0.2275, -0.135, { type : >>>Const.LOCUS_GOODS_INGAMER, cube : 0 });
	__addLocus(self, 'goods2', -0.16, -0.135, { type : >>>Const.LOCUS_GOODS_INGAMER, cube : 0 });

	// товары проданные
	__addLocus(self, 'goods', -0.16, -0.2025, { type : >>>Const.LOCUS_GOODS_SALES });

	// серебро
	__addLocus(self, 'silver', -0.3, -0.1675, { type : >>>Const.LOCUS_SILVER });

	// рабочие
	__addLocus(self, 'worker', -0.2975, 0.195, { type : >>>Const.LOCUS_WORKER });

	// кубики
	__addLocus(self, 'cube0', 0.0775, -0.225, { type : >>>Const.LOCUS_CUBE_GAMER });
	__addLocus(self, 'cube1', 0.1175, -0.225, { type : >>>Const.LOCUS_CUBE_GAMER });
	__addLocus(self, 'cubeJoker', 0.0375, -0.225, { type : >>>Const.LOCUS_CUBE_GAMER });
	__addLocus(self, 'cubeRest', 0.2925, -0.1875, { type : >>>Const.LOCUS_CUBE_GAMER });

	// бонус
	__addLocus(self, 'bonus', 0.3125, -0.1125, { type : >>>Const.LOCUS_BONUS_INGAMER });
	
	// счетчики +100
	__addLocus(self, 'point100', -0.035, -0.22, { type : >>>Const.LOCUS_COUNTER });
}

function __addLocus(self, name, x, y, info) {
	var locus = new lexedo.games.Cofb.Locus(name, x, y, self);
	self.locus[name] = locus;
	for (var i in info) locus[i] = info[i];
}
