#lx:macros Const {lexedo.games.Cofb.Constants};

class Gamer #lx:namespace lexedo.games.Cofb {
	constructor(game, id, sequence) {
		this.game = game;
		this.id = id;
		this.cubes = [null, null];
		this.knowledges = [];

		this.points = 0;
		this.pointsInfo = [];
		this.round = 0;
		this.cubesPlayed = false;
		this.silverUsed = false;

		this.cubeJoker = [];
		this.dowbleGoods = 0;
		this.goodsUsed = 0;

		this.AI = false;

		this.counterChip = this.genChip();
		this.sequenceChip = this.genChip();

		this.plan = new lexedo.games.Cofb.Plan(this, 0);

		this.cubes[0] = new lexedo.games.Cofb.Cube(this.game, id, 0);
		this.cubes[1] = new lexedo.games.Cofb.Cube(this.game, id, 1);

		this.plan.locus['cube0'].locate( this.cubes[0] );
		this.plan.locus['cube1'].locate( this.cubes[1] );

		var info = this.game.packs.darkgreen.getOne(),
			chip = info.genChip();
		this.plan.locus['advLoc18'].locate(chip);

		var goods = [];
		for (var i=0; i<3; i++) goods.push( this.game.packs.goods.getOne() );

		for (var i in goods) {
			var g = goods[i],
				chip = g.genChip();

			for (var j=0; j<3; j++) {
				var loc = this.plan.locus['goods' + j];

				if (!loc.chips.length || loc.chips[0].info.variant == g.variant) {
					loc.locate(chip);
					break;
				}
			}
		}

		var silver = this.game.packs.silver.getOne(),
			chip = silver.genChip();
		this.plan.locus['silver'].locate(chip);

		var workers = [];
		for (var i=0; i<sequence; i++) workers.push( this.game.packs.worker.getOne() );
		for (var i in workers) {
			var chip = workers[i].genChip();
			this.plan.locus['worker'].locate(chip);
		}


		this.actions = [];
	}

	clear() {
		for (var i in this.plan.locus)
			this.plan.locus[i].delChips();

		this.cubes = [null, null];
		this.knowledges = [];

		this.points = 0;
		this.pointsInfo = [];
		this.round = 0;
		this.cubesPlayed = false;
		this.silverUsed = false;

		this.cubeJoker = [];
		this.dowbleGoods = 0;
		this.goodsUsed = 0;

		this.AI = false;

		this.game.world.removeMesh( this.plan.mesh );

		this.plan = null;
	}

	genChip() {
		var chip = new lexedo.games.Cofb.Chip(this.game, this),
			color = >>>Const.GAMER_COLOR[this.id];
		chip.create({ face : color, side : color });
		return chip;		
	}

	getName() {
		return >>>Const.GAMER_NAMES[ this.id ];
	}

	activate() {
		this.round++;

		if (!this.AI) this.game.world.cameraAnimator.on( this.plan.mesh.position, >>>Const.STATUS_PENDING );
		else {
			var v0 = this.game.field.mesh.position,
				v1 = this.plan.mesh.position,
				v = new THREE.Vector3();
			v.subVectors( v1, v0 );
			v.multiplyScalar( 0.5 );
			v.addVectors( v0, v );
			this.game.world.cameraAnimator.on( v, >>>Const.STATUS_PENDING, 1500 );
		}

		this.game.triggerLocalEvent('cofb_gamer_activated', this);
	}

	getJokerCube() {
		var cube = new lexedo.games.Cofb.Cube(this.game, this.id, 2);
		this.cubeJoker.push(cube);
		cube.applyValue(7);
		return cube;
	}

	reset() {
		this.plan.locus['cube0'].locate( this.cubes[0] );
		this.plan.locus['cube1'].locate( this.cubes[1] );
		this.plan.locus['cubeJoker'].delChips();
		this.plan.locus['cubeRest'].delChips();
		this.cubeJoker = [];
		this.cubesPlayed = false;

		this.silverUsed = false;

		this.dowbleGoods = 0;
		this.goodsUsed = 0;
	}

	addKnowledge(val) {
		this.knowledges['k' + (val - 2)] = true;
	}

	knows(k) {
		return (k in this.knowledges);
	}

	freeAdvSlot() {
		var locs = this.plan.locus,
			loc = null;
		if ( !locs['advWait0'].chips.length ) loc = locs['advWait0'];
		else if ( !locs['advWait1'].chips.length ) loc = locs['advWait1'];
		else if ( !locs['advWait2'].chips.length ) loc = locs['advWait2'];
		return loc;
	}

	bye(chip) {
		var loc = this.freeAdvSlot();

		this.plan.locus['silver'].delChips(2);
		this.silverUsed = true;
		this.game.chipMoveAnimator.on(chip, loc, ()=>this.game.status.setPending());
	}

	changeCubeToWorker() {
		var loc0 = this.game.activeCube.locus;

		var chips = [ this.game.activeCube ],
			dests = [ this.plan.locus['cubeRest'] ];

		var worker = this.game.packs.worker.getOne(),
			chip = worker.genChip();
		loc0.locate(chip);
		chips.push( chip );
		dests.push( this.plan.locus['worker'] );

		worker = this.game.packs.worker.getOne();
		chip = worker.genChip();
		loc0.locate(chip);
		chips.push( chip );
		dests.push( this.plan.locus['worker'] );

		if ( this.knows('k14') ) {
			worker = this.game.packs.worker.getOne();
			chip = worker.genChip();
			loc0.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['worker'] );

			worker = this.game.packs.worker.getOne();
			chip = worker.genChip();
			loc0.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['worker'] );
		}

		if ( this.knows('k13') ) {
			worker = this.game.packs.silver.getOne();
			chip = worker.genChip();
			loc0.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['silver'] );
		}

		var game = this.game;
		game.chipMoveAnimator.on(chips, dests, function() {
			game.activeCube = null;
			game.status.setPending();
		});
	}

	sellGoods(locus, useCube, x, y) {
		var points = this.game.gamerKeys.length * locus.chips.length,
			pos = this.counterChip.locus.pos;
		this.points += points;
		this.pointsInfo.push({ cod : >>>Const.SCORE_GOODS, info : locus.chips.length, amt : points });

		var chips = [], dests = [];

		if (useCube) {
			chips = [ this.game.activeCube ],
			dests = [ this.plan.locus['cubeRest'] ];
		}

		for (var i in locus.chips) {
			var chip = locus.chips[i];
			chip.turn();
			chips.push( chip );
			dests.push( this.plan.locus['goods'] );
		}

		var silver = this.game.packs.silver.getOne(),
			chip = silver.genChip();
		locus.locate(chip);
		chips.push( chip );
		dests.push( this.plan.locus['silver'] );

		if ( this.knows('k3') ) {
			silver = this.game.packs.silver.getOne();
			chip = silver.genChip();
			locus.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['silver'] );
		}

		if ( this.knows('k4') ) {
			var worker = this.game.packs.worker.getOne();
			chip = worker.genChip();
			locus.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['worker'] );
		}

		var newPos = pos + points;
		if (newPos >= 100) {
			newPos -= 100;
			var chip100 = this.game.packs.point100[this.id].getOne().genChip();
			this.counterChip.locus.locate( chip100 );
			chips.push( chip100 );
			dests.push( this.plan.locus['point100'] );
		}
		chips.push( this.counterChip );
		dests.push( this.game.field.locus['point' + newPos] );

		var game = this.game;
		game.chipMoveAnimator.on(chips, dests, ()=>{
			game.activeCube = null;
			game.status.setPending();
			game.getPlugin()->>floatPoints.start(['Проданы товары: +' + points], x, y);
		});
	}

	getChip(chip) {
		var loc = this.freeAdvSlot(),
			game = this.game;
		game.chipMoveAnimator.on([chip, this.game.activeCube], [loc, this.plan.locus['cubeRest']], function() {
			game.activeCube = null;
			game.status.setPending();
		});
	}

	findPlace(chip, nums) {
		var locs = [];

		for (var i=0; i<37; i++) {
			var loc = this.plan.locus['advLoc' + i];

			if (loc.chips.length) continue;
			if (loc.groupe != chip.info.groupe) continue;
			var index = nums.indexOf( loc.cube );
			if (index == -1) continue;

			var neib = this.plan.advLocNeibor(loc);
			var fill = false;
			for (var j in neib) if (neib[j].chips.length) { fill = true; break; }
			if (!fill) continue;

			if (chip.info.groupe == >>>Const.GROUPE_BUILDING && !this.knows('k1')) {
				var area = this.plan.area(loc);

				var match = false;
				for (var j in area)
					if (area[j].chips.length && area[j].chips[0].info.variant == chip.info.variant)
						{ match = true; break; }

				if (match) continue;
			}

			locs.push(loc);
		}

		return locs;
	}

	tryFindPlace(chip) {
		this.game.world.clearSpiritStaff();

		var cube = this.game.activeCube.value,
			arr = [cube];
		if (cube == 7) arr = [1, 2, 3, 4, 5, 6];
		else {
			if ( ( this.knows('k9') && (chip.info.groupe == >>>Const.GROUPE_BUILDING) )
			|| ( this.knows('k10') && (chip.info.groupe == >>>Const.GROUPE_SHIP || chip.info.groupe == >>>Const.GROUPE_ANIMAL) )
			|| ( this.knows('k11') && (chip.info.groupe == >>>Const.GROUPE_CASTLE || chip.info.groupe == >>>Const.GROUPE_MINE || chip.info.groupe == >>>Const.GROUPE_KNOWLEGE) ) ) {
				var p = cube + 1,
					m = cube - 1;
				if (p > 6) p -= 6;
				if (m < 1) m += 6;
				arr = [ cube, p, m ];
			}
		}

		var locs = this.findPlace(chip, arr);

		this.game.world.createSpiritStaff(chip, locs);
	}

	applyChip(chip, loc, x, y) {
		var game = this.game;
		game.chipMoveAnimator.on([chip, this.game.activeCube], [loc, this.plan.locus['cubeRest']], function() {
			game.activeCube = null;
			game.gamer().chipApplyPassiveResult(chip, x, y);
		});
	}

	chipApplyPassiveResult(chip, x, y) {
		// собираем пассивные эффекты
		var chips = [], dests = [],
			msgs = [],
			points = 0,
			loc = chip.locus,
			area = this.plan.area(loc),
			fullGroupe = [];

		for (var i=0; i<37; i++) {
			var l = this.plan.locus['advLoc' + i];
			if (l.groupe == loc.groupe) fullGroupe.push(l);
		}

		// от корабля - перемещение фишки очередности хода
		if ( chip.info.groupe == >>>Const.GROUPE_SHIP ) {
			var curr = this.sequenceChip.locus,
				pos = +curr.name[3];

			chips.push( this.sequenceChip );
			dests.push( this.game.field.locus['seq' + (pos+1)] );
		}

		// от животных - очки
		if ( chip.info.groupe == >>>Const.GROUPE_ANIMAL ) {
			var count = 0,
				animGr = Math.floor( (chip.info.variant - 29) / 3 );

			for (var i in area) {
				var l = area[i];

				if ( !l.chips.length ) continue;

				var val = l.chips[0].info.variant - 29,
					gr = Math.floor( val / 3 ),
					tp = val % 3,
					bonus = (this.knows('k7')) ? 1 : 0;

				if (gr == animGr) count += (2 + tp + bonus);
			}

			points += count;
			this.pointsInfo.push({ cod : >>>Const.SCORE_ANIMAL, info : animGr + '.' + ((chip.info.variant - 29)%3+2), amt : count });
			msgs.push( 'Введение животных: +' + count );
		}

		// от замка кубик-джокер
		if ( chip.info.groupe == >>>Const.GROUPE_CASTLE ) {
			var cube = this.getJokerCube();
			loc.locate( cube );
			chips.push( cube );
			dests.push( this.plan.locus['cubeJoker'] );
		}

		// от гостиницы 4 рабочих
		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_HOTEL ) {
			for (var i=0; i<4; i++) {
				var ch = this.game.packs.worker.getOne().genChip();
				loc.locate(ch);
				chips.push( ch );
				dests.push( this.plan.locus['worker'] );
			}
		}

		// от банка 2 серебра
		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_BANK ) {
			for (var i=0; i<2; i++) {
				var ch = this.game.packs.silver.getOne().genChip();
				loc.locate(ch);
				chips.push( ch );
				dests.push( this.plan.locus['silver'] );
			}
		}

		// от башни 4 очка
		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_WATCHTOWER ) {
			points += 4;
			this.pointsInfo.push({ cod : >>>Const.SCORE_TOWER, info : 0, amt : 4 });
			msgs.push('Постройка сторожевой башни: +' + 4);
		}

		// от заполнения области очки
		var filled = true;
		for (var i in area) {
			var l = area[i];
			if ( !l.chips.length ) { filled = false; break; }
		}
		if (filled) {
			var tab = [1, 3, 6, 10, 15, 21, 28, 36],
				fillPoints = tab[ area.length - 1 ],
				phaseBonus = 12 - this.game.phase * 2;
			points += fillPoints + phaseBonus;
			this.pointsInfo.push({ cod : >>>Const.SCORE_FILL, info : area.length, amt : fillPoints });
			this.pointsInfo.push({ cod : >>>Const.SCORE_FILLBONUS, info : this.game.phase, amt : phaseBonus });

			msgs.push('Заполнение области: +' + (fillPoints + phaseBonus));
		}

		// итого очки
		if (points) {
			this.points += points;
			var pos = this.counterChip.locus.pos,
				newPos = pos + points;
			if (newPos >= 100) {
				newPos -= 100;
				var chip100 = this.game.packs.point100[this.id].getOne().genChip();
				this.counterChip.locus.locate(chip100);
				chips.push( chip100 );
				dests.push( this.plan.locus['point100'] );
			}
			chips.push( this.counterChip );			
			dests.push( this.game.field.locus['point' + newPos] );
		}

		// заполнение всего цвета => бонус
		var filled = true;
		for (var i in fullGroupe) {
			var l = fullGroupe[i];
			if ( !l.chips.length ) { filled = false; break; }
		}
		if (filled) {
			if ( this.game.field.locus['bmax' + chip.info.groupe].chips.length ) {
				chips.push( this.game.field.locus['bmax' + chip.info.groupe].chips[0] );
				dests.push( this.plan.locus['bonus'] );
			} else if ( this.game.field.locus['bmin' + chip.info.groupe].chips.length ) {
				chips.push( this.game.field.locus['bmin' + chip.info.groupe].chips[0] );
				dests.push( this.plan.locus['bonus'] );
			}
		}

		// технологии в перечень
		if ( chip.info.groupe == >>>Const.GROUPE_KNOWLEGE ) this.addKnowledge( chip.info.variant );

		if (chips.length) this.game.chipMoveAnimator.on(chips, dests, ()=>{
			this.game.gamer().chipApplyActiveResult(chip);
		});
		else this.game.gamer().chipApplyActiveResult(chip);


		// console.log( 'chipApplyPassiveResult end' );


		// теперь к активным эффектам
		// this.chipApplyActiveResult(chip);

		if ( msgs.length ) this.game.getPlugin()->>floatPoints.start( msgs, x, y );
	}

	chipApplyActiveResult(chip) {
		if ( chip.info.groupe == >>>Const.GROUPE_SHIP ) {
			var goods = false;
			for (var i=1; i<7; i++) if ( this.game.field.locus['goods' + i].chips.length ) { goods = true; break; }
			if (goods) {
				this.game.status.setGetGoods({dowble:false});
				return;
			}
		}

		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_TRADEPOST ) {
			var goods = false;
			for (var i=0; i<3; i++) if ( this.plan.locus['goods' + i].chips.length ) { goods = true; break; }

			if (goods) {
				this.game.status.setTrade();
				return;
			}
		}

		var map = [ 125, 120, 133, 144, 223, 221, 235, 245, 324, 325, 330, 343, 420, 425, 434, 442, 522, 523, 535, 545, 625, 624, 631, 640 ];
		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_SAWMILL ) {
			var chipExist = false;
			for (var i in map) {
				var loc = this.game.field.locus['advCube' + map[i]];
				if ( loc.chips.length && loc.chips[0].info.groupe == >>>Const.GROUPE_BUILDING ) { chipExist = true; break; }
			}
			if (chipExist) {
				this.game.status.setGetBuilding();
				return;
			}
		}

		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_CHURCH ) {
			var chipExist = false;
			for (var i in map) {
				var loc = this.game.field.locus['advCube' + map[i]];
				if ( loc.chips.length 
				&& (loc.chips[0].info.groupe == >>>Const.GROUPE_MINE
				|| loc.chips[0].info.groupe == >>>Const.GROUPE_CASTLE
				|| loc.chips[0].info.groupe == >>>Const.GROUPE_KNOWLEGE) ) { chipExist = true; break; }
			}
			if (chipExist) {
				this.game.status.setGetMCK();
				return;
			}
		}

		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_MARKET ) {
			var chipExist = false;
			for (var i in map) {
				var loc = this.game.field.locus['advCube' + map[i]];
				if ( loc.chips.length 
				&& (loc.chips[0].info.groupe == >>>Const.GROUPE_ANIMAL
				|| loc.chips[0].info.groupe == >>>Const.GROUPE_SHIP) ) { chipExist = true; break; }
			}
			if (chipExist) {
				this.game.status.setGetAS();
				return;
			}
		}

		if ( chip.info.variant == >>>Const.VARIANT_BUILDING_TOWNHALL ) {
			var chipExist = false;
			for (var i=0; i<3; i++) {
				var loc = this.plan.locus['advWait' + i];
				if ( loc.chips.length ) { chipExist = true; break; }
			}
			if (chipExist) {
				this.game.status.setSetChip();
				return;
			}
		}

		// console.log( 'chipApplyActiveResult end' );

		this.game.status.setPending();
	}

	getGoods(chip) {
		var map = [-1, -1, -1];
		for (var i=0; i<3; i++) {
			var loc = this.plan.locus['goods' + i];
			if ( !loc.chips.length ) continue;

			map[i] = loc.chips[0].info.variant;
		}

		var sortGoods = [[], [], []];
		var goods = chip.locus.chips;
		for (var i in goods) {
			var sorted = false;
			for (var j in map) {
				if (goods[i].info.variant == map[j]) { sortGoods[j].push(goods[i]); sorted = true; }
			}

			if (!sorted)
				for (var j in map) if (map[j] == -1) {
					map[j] = goods[i].info.variant;
					sortGoods[j].push(goods[i]);
					break;
				}
		}

		var chips = [], dests = [];

		for (var i in sortGoods) {
			for (var j in sortGoods[i]) {
				chips.push( sortGoods[i][j] );
				dests.push( this.plan.locus['goods' + i] );
			}
		}

		this.goodsUsed = +chip.locus.name[5];

		if (chips.length) {
			this.game.chipMoveAnimator.on(chips, dests, ()=>__check5(this));
		} else __check5(this);
	}
}

function __check5(self) {
	var gamer = self.game.gamer();
	if (!gamer.knows('k5')) {
		gamer.goodsUsed = 0;
		self.game.status.setPending();
		return;
	}

	if (gamer.dowbleGoods == 1) {
		gamer.dowbleGoods = 0;
		gamer.goodsUsed = 0;
		self.game.status.setPending();
		return;
	}

	var p = gamer.goodsUsed + 1,
		m = gamer.goodsUsed - 1;
	if (p > 6) p = 1;
	if (m < 1) m = 6;

	if ( !self.game.field.locus['goods' + p].chips.length && !self.game.field.locus['goods' + m].chips.length ) {
		gamer.dowbleGoods = 0;
		gamer.goodsUsed = 0;
		self.game.status.setPending();
		return;
	}

	gamer.dowbleGoods = 1;
	self.game.status.setGetGoods({dowble:true});
}
