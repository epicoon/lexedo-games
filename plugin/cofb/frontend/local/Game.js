#lx:module lexedo.games.CofbLocal;

#lx:macros Const {lexedo.games.Cofb.Constants};

#lx:use lexedo.games;

#lx:require -R @site/lib/lx3d/;
#lx:require @site/lib/Math3d.js;
#lx:require Gamer;
#lx:require -R ../src/;

#lx:private;

class Game extends lexedo.games.Game #lx:namespace lexedo.games.Cofb {
	init() {			
		this.field = null;
		this.gamers = [];
		this.gamerKeys = [];
		this.ai = null;
		this.packs = new lexedo.games.Cofb.Packs(this);

		this.cube = null;
		this.activeCube = null;
		this.phase = 0;
		this.round = 0;
		this.activeGamer = -1;

		this.status = new lexedo.games.Cofb.Status(this);

		this.cubeAnimator = new lexedo.games.Cofb.CubeAnimator(this);
		this.phaseAnimator = new lexedo.games.Cofb.PhaseAnimator(this);
		this.chipMoveAnimator = new lexedo.games.Cofb.ChipMoveAnimator(this);
		this.pulsator = new lexedo.games.Cofb.Pulsator(this);

		__prepateEventSupervisor(this);

		this.world = new lexedo.games.Cofb.World({
			game : this,
			canvas : this.getPlugin()->>canvas,
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
		this.world.createTable();		

		__prepareField(this);
		__preparePacks(this);
	}

	triggerLocalEvent(name, args = []) {
		this.eventSupervisor.trigger(name, args);
	}

	subscribeLocalEvent(name, callback) {
		this.eventSupervisor.subscribe(name, callback);
	}

	reset() {
		for (var i in this.field.locus) {
			if (i == 'cube') continue;
			this.field.locus[i].delChips();
		}
		for (var i in this.gamers)
			this.gamers[i].clear();
	
		this.activeCube = null;
		this.phase = 0;
		this.round = 0;
		this.activeGamer = -1;
		this.gamers = [];
		this.gamerKeys = [];

		this.packs.clear();
		__preparePacks(this);
	}

	onStatusChange(newStatus) {
		if (this.status.isAI()) {
			this.ai.setGamer( this.gamer() );
			return;
		}

		if (this.gamer() && this.gamer().AI) {
			this.status.setAI();
			return;
		}

		this.world.clearSpiritStaff();

		if (this.activeGamer != -1) {
			var gamer = this.gamer();
			if (!gamer.plan.locus['cube0'].chips.length
			&& !gamer.plan.locus['cube1'].chips.length
			&& !gamer.plan.locus['cubeJoker'].chips.length) this.triggerLocalEvent('cofb_gamer_move_ends');
		}

		switch (true) {
			case this.status.isPhaseActivate():
			case this.status.isPlayOutCubes(): this.world.cameraAnimator.on(this.field.mesh.position); break;
		}

		this.pulsator.on();
	}

	applyCubeResult() {
		var r = this.round,
			loc = this.field.locus['tn' + r],
			chip = loc.chips[0],
			dest = this.field.locus[ 'goods' + this.cube.value ];

		var _game = this;
		this.chipMoveAnimator.on( chip, dest, function() {
			_game.turnsBegin();
		});
	}

	addGamer(id, sequence) {
		var gamer = new lexedo.games.Cofb.Gamer(this, id, sequence);
		var key = 'g' + id;
		this.gamerKeys.push( key );
		this.gamers[key] = gamer;
		return gamer;
	}

	gamer() {
		if (this.activeGamer == -1) return null;
		return this.gamers['g' + this.activeGamer];
	}

	locateAdvChips(amt) {
		if (amt === undefined) amt = this.gamerKeys.length;

		var cubeLocs = [],
			sellLocs = [];
		for (var i in this.field.locus) {
			var l = this.field.locus[i];
			if (l.amt <= amt) {
				if (l.type == >>>Const.LOCUS_ADVANTAGE_CUBE) cubeLocs.push( this.field.locus[i] );
				if (l.type == >>>Const.LOCUS_ADVANTAGE_FORSALE) sellLocs.push( this.field.locus[i] );
			}
		} 

		for (var i in cubeLocs) {
			var loc = cubeLocs[i];
			var chipInfo;
			if (loc.groupe2 && amt == 3 && (this.phase == 1 || this.phase == 3))
				chipInfo = this.packs.advPack[loc.groupe2].getOne();
			else chipInfo = this.packs.advPack[loc.groupe].getOne();
			var chip = chipInfo.genChip();
			loc.locate(chip);
		}

		for (var i in sellLocs) {
			var loc = sellLocs[i];
			var chipInfo = this.packs.black.getOne();
			var chip = chipInfo.genChip();
			loc.locate(chip);
		}
	}

	locateChipsToStart(amt) {
		if (amt === undefined) amt = this.gamerKeys.length;

		this.locateAdvChips(amt);

		var goods = [];
		for (var i=0; i<25; i++) goods.push( this.packs.goods.getOne() );

		for (var i in goods) {
			var chip = goods[i].genChip();
			chip.turn();
			var loc = this.field.locus['st' + (Math.floor(i / 5) + 1)];
			loc.locate(chip);
		}

		for (var i=0; i<6; i++) {
			var bmax = this.packs.bonusMax.getOne(),
				bmin = this.packs.bonusMin.getOne();

			this.field.locus['bmax' + i].locate( bmax.genChip() );
			this.field.locus['bmin' + i].locate( bmin.genChip() );
		}
	}

	/**
	 * data: [
	 *	{num:0, seg:1, ai:false},
	 *	{{num:1, seg:2, ai:false}}
	 * ]
	 * */
	start(data) {
		data.sort(function(a, b) {
			if (a.seg > b.seg) return 1;
			if (a.seg < b.seg) return -1;
			return 0;
		});

		var indent = >>>Const.FIELD_SIZE * 0.02,
			planW = >>>Const.FIELD_SIZE * 0.7,
			planD = planW * 0.723,
			zShift = (this.field.sizes[2] + planD) * 0.5 + indent,
			xShift = (planW + indent) * 0.5;

		var positionsMap = (data.length == 3)
			? [ [-xShift, 0, zShift], [xShift, 0, zShift], [0, 0, -zShift] ]
			: [ [-xShift, 0, zShift], [xShift, 0, zShift], [-xShift, 0, -zShift], [xShift, 0, -zShift] ];

		var withAi = false;
		for (var i=0; i<data.length; i++) {
			var gamer = this.addGamer( data[i].num, data.length - i );
			gamer.AI = data[i].ai;
			var chip = gamer.sequenceChip;
			this.field.locus['seq0'].locate( chip );
			chip = gamer.counterChip;
			this.field.locus['point0'].locate( chip );

			var plan = gamer.plan;
			plan.setPosition( positionsMap[i] );

			if (gamer.AI) withAi = true;
		}
		if (withAi) this.ai = new lexedo.games.Cofb.AI.AI(this);

		this.locateChipsToStart();
		this.status.setPhaseActivate();
	}

	nextPhase() {
		for (var i in this.gamers) this.gamers[i].round = 0;
		this.phase++;
		this.nextRound();
	}

	nextRound() {
		for (var i in this.gamers) this.gamers[i].reset();
		this.round++;
		this.status.setPlayOutCubes();
	}

	findNextGamer() {
		this.activeGamer = -1;
		var find = false;
		for (var i=6; i>=0; i--) {
			var loc = this.field.locus['seq' + i];

			for (var j=loc.chips.length-1; j>=0; j--) {
				var chip = loc.chips[j],
					id = chip.info.id,
					gamer = this.gamers['g' + id];

				if (gamer.round < this.round) { this.activeGamer = id; find = true; }
				if (find) break;
			}

			if (find) break;
		}
	}

	turnsBegin() {
		this.findNextGamer();
		this.gamer().activate();
	}

	prepareForMining() {
		var chips = [], dests = [];

		for (var i in this.gamers) {
			var g = this.gamers[i];
			for (var j=0; j<37; j++) {
				var loc = g.plan.locus['advLoc' + j];

				if ( loc.chips.length && loc.chips[0].info.groupe == >>>Const.GROUPE_MINE ) {
					var chip = this.packs.silver.getOne().genChip();
					loc.locate(chip);
					chips.push( chip );
					dests.push( g.plan.locus['silver'] );

					if (g.knows('k2')) {
						var chip = this.packs.worker.getOne().genChip();
						loc.locate(chip);
						chips.push( chip );
						dests.push( g.plan.locus['worker'] );
					}
				}
			}
		}

		return [ chips, dests ];
	}

	calcFinalScore() {
		for (var i in this.gamers) {
			var g = this.gamers[i];

			var workers = Math.floor( g.plan.locus['worker'].chips.length * 0.5 );
			if (workers)
				g.pointsInfo.push({ cod : >>>Const.SCORE_WORKER, info : g.plan.locus['worker'].chips.length, amt : workers });

			var silver = g.plan.locus['silver'].chips.length;
			if (silver)
				g.pointsInfo.push({ cod : >>>Const.SCORE_SILVER, info : 0, amt : silver });

			var goods = g.plan.locus['goods0'].chips.length +
				g.plan.locus['goods1'].chips.length +
				g.plan.locus['goods2'].chips.length;
			if (goods)
				g.pointsInfo.push({ cod : >>>Const.SCORE_LOSTGOODS, info : 0, amt : goods });

			for (var j=0; j<g.plan.locus['bonus'].chips.length; j++) {
				var chip = g.plan.locus['bonus'].chips[j];
				var points;
				if (chip.info.groupe == >>>Const.GROUPE_BONUS_MIN) points = 0;
				else points = 3;
				points += this.gamerKeys.length;
				g.pointsInfo.push({ cod : >>>Const.SCORE_BONUS, info : chip.info.variant, amt : points });
			}

			if (g.knows('k15')) {
				var goodsTypes = [0, 0, 0, 0, 0, 0];
				for (var j in g.plan.locus['goods'].chips) {
					var chip = g.plan.locus['goods'].chips[j];
					goodsTypes[ chip.info.variant - 1 ] = 1;
				}
				var total = 0;
				for (var j in goodsTypes) total += goodsTypes[j];
				if (total)
					g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_15, amt : total * 3 });
			}

			if (g.knows('k25')) {
				var goods = g.plan.locus['goods'].chips.length;
				if (goods)
					g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_25, amt : goods });
			}

			if (g.knows('k26')) {
				var bonus = g.plan.locus['bonus'].chips.length;
				if (bonus)
					g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_26, amt : bonus * 2 });
			}

			var store = 0,
				tower = 0,
				sawmill = 0,
				temple = 0,
				market = 0,
				hotel = 0,
				bank = 0,
				townhall = 0,
				animal = [0, 0, 0, 0];
			for (var j=0; j<37; j++) {
				var loc = g.plan.locus['advLoc' + j];
				if (!loc.chips.length) continue;

				var chip = loc.chips[0];

				if ( chip.info.groupe == >>>Const.GROUPE_BUILDING ) {
					switch (chip.info.variant) {
						case >>>Const.VARIANT_BUILDING_SAWMILL : sawmill++; break;
						case >>>Const.VARIANT_BUILDING_TRADEPOST : store++; break;
						case >>>Const.VARIANT_BUILDING_WATCHTOWER : tower++; break;
						case >>>Const.VARIANT_BUILDING_CHURCH : temple++; break;
						case >>>Const.VARIANT_BUILDING_MARKET : market++; break;
						case >>>Const.VARIANT_BUILDING_HOTEL : hotel++; break;
						case >>>Const.VARIANT_BUILDING_BANK : bank++; break;
						case >>>Const.VARIANT_BUILDING_TOWNHALL : townhall++; break;
					}
					continue;
				}

				if ( chip.info.groupe != >>>Const.GROUPE_ANIMAL ) continue;

				var gr = Math.floor( (chip.info.variant - 29) / 3 );
				animal[gr] = 1;
			}
			var animals = 0;
			for (var j in animal) animals += animal[j];

			if (g.knows('k16')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_16, amt : store * 4 });
			if (g.knows('k17')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_17, amt : tower * 4 });
			if (g.knows('k18')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_18, amt : sawmill * 4 });
			if (g.knows('k19')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_19, amt : temple * 4 });
			if (g.knows('k20')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_20, amt : market * 4 });
			if (g.knows('k21')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_21, amt : hotel * 4 });
			if (g.knows('k22')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_22, amt : bank * 4 });
			if (g.knows('k23')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_23, amt : townhall * 4 });
			if (g.knows('k24')) g.pointsInfo.push({ cod : >>>Const.SCORE_KNOWELEGE, info : >>>Const.VARIANT_KNOWLEDGE_24, amt : animals * 4 });
		}
	}

	phaseEndAnalis() {
		if (this.phase < 5) {
			for (var i in this.field.locus) {
				var l = this.field.locus[i];
				if (l.type == >>>Const.LOCUS_ADVANTAGE_CUBE || l.type == >>>Const.LOCUS_ADVANTAGE_FORSALE) l.delChips();
			}
			this.round = 0;
			for (var i in this.gamers) this.gamers[i].round = 0;
			this.locateAdvChips();
			this.status.setPhaseActivate();
		} else {
			this.calcFinalScore();
			this.status.setOver();
		}
	}

	phaseEnd() {
		var mining = this.prepareForMining();

		var _game = this;
		this.chipMoveAnimator.on(mining[0], mining[1], function() { _game.phaseEndAnalis(); });
	}

	passMove() {
		this.findNextGamer();

		if (this.activeGamer != -1) {
			this.gamer().activate();
		} else {
			// новый раунд
			if (this.round < 5) this.nextRound();
			// фаза закончилась
			else this.phaseEnd();
		}
	}

	checkChipClick(chip, event, intersectPoint) {
		if ( this.activeGamer != -1 && this.gamer().AI ) return;

		switch (true) {
			case this.status.isPlayOutCubes() : {
				if ( chip.name.substr(0, 4) != 'cube' ) return;

				var cubes = [ this.cube ];
				for (var i in this.gamers) {
					cubes.push( this.gamers[i].cubes[0] );
					cubes.push( this.gamers[i].cubes[1] );
				}

				this.cubeAnimator.on( cubes );
			} break;

			case this.status.isPhaseActivate() : {
				if (!chip.info) return;
				var info = chip.info;
				if ( info.groupe != >>>Const.GROUPE_GOODS ) return;
				if ( chip.locus.name.substr(0, 2) != 'st' ) return;
				if ( +chip.locus.name[2] - 1 != this.phase ) return;

				this.phaseAnimator.on( chip.locus );
			} break;


			case this.status.isPending() : this.checkChipWhilePending( chip, event ); break;
			case this.status.isUseSilver() : this.checkChipOnUseSilver(chip); break;
			case this.status.isUseCube() : this.checkChipOnUseCube(chip, event, intersectPoint); break;

			case this.status.isGetGoods() : this.checkGetGoods(chip); break;
			case this.status.isTrade() : this.checkTrade(chip, event); break;

			case this.status.isGetBuilding() : this.checkGetChip(chip, [ >>>Const.GROUPE_BUILDING ]); break;
			case this.status.isGetMCK() : this.checkGetChip(chip, [ >>>Const.GROUPE_MINE, >>>Const.GROUPE_CASTLE, >>>Const.GROUPE_KNOWLEGE ]); break;
			case this.status.isGetAS() : this.checkGetChip(chip, [ >>>Const.GROUPE_ANIMAL, >>>Const.GROUPE_SHIP ]); break;

			case this.status.isSetChip() : this.checkSetChip(chip, event); break
		}
	}

	checkChipWhilePending(chip, event) {
		if ( chip.name.substr(0, 4) == 'cube' ) {
			if ( chip.id != this.activeGamer ) return;
			if ( chip.locus.name == 'cubeRest' ) return;

			this.activeCube = chip;

			this.status.setUseCube({
				value: chip.value,
				event
			});
			return;
		}

		if (!chip.info) return;

		if ( chip.info.groupe == >>>Const.GROUPE_SILVER ) {
			if ( chip.locus.parent.gamer.id != this.activeGamer ) return;
			if ( chip.locus.chips.length < 2 ) return;
			if ( this.gamer().silverUsed ) return;

			this.status.setUseSilver({event});
			return;
		}

		if ( chip.locus.name.substr(0, 7) == 'advWait' && chip.locus.parent.gamer.id == this.activeGamer ) {
			this.getPlugin()->>confirmPopup.open('Уверены, что хотите сбросить эту фишку из игры?', ()=>{
				chip.del();
			});
		}
	}

	checkChipOnUseSilver(chip) {
		if (!chip.info) return;

		if ( chip.info.groupe == >>>Const.GROUPE_SILVER && chip.locus.parent.gamer.id == this.activeGamer ) {
			this.status.setPending();
			return;
		}

		var gamer = this.gamer();
		if ( gamer.silverUsed ) return;
		if ( gamer.freeAdvSlot() == null ) return;

		var loctype = chip.locus.name.substr(0, 7);
		if ( loctype == 'advSell' || ( loctype == 'advCube' && gamer.knows('k6') ) ) {
			gamer.bye(chip);
		}
	}

	checkChipOnUseCube(chip, event, intersectPoint) {
		if ( chip === this.activeCube ) {
			this.activeCube = null;
			this.status.setPending();
			return;
		}

		var gamer = this.gamer();

		//TODO chip.area - оптеледение, что не чип, а план
		// использование, добавление рабочих
		if (chip.area) {
			if ( chip !== gamer.plan ) return;
			if ( chip.locus['worker'].chips.length ) return;

			var x = gamer.plan.mesh.position.x + gamer.plan.locus['worker'].x * >>>Const.FIELD_SIZE,
				z = gamer.plan.mesh.position.z + gamer.plan.locus['worker'].z * >>>Const.FIELD_SIZE,
				delta = 0.0625 * >>>Const.FIELD_SIZE;

			if ( intersectPoint.x > x + delta || intersectPoint.x < x - delta
				|| intersectPoint.z > z + delta || intersectPoint.z < z - delta ) return;

			this.getPlugin()->>workerMenu.open();
			return;
		}

		// введение фишки в вотчину
		if ( chip.name.substr(0, 6) == 'spirit' ) {
			var locName = chip.name.split('.')[1],
				loc = gamer.plan.locus[locName],
				chip = this.world.getSpiritInitiator();

			this.world.clearSpiritStaff();
			gamer.applyChip(chip, loc, event.clientX, event.clientY);
			return;
		}

		if (!chip.info) return;

		if (chip.info.groupe == >>>Const.GROUPE_WORKER && chip.locus.parent.gamer.id == this.activeGamer) {
			this.getPlugin()->>workerMenu.open();
			return;
		}

		// продажа товаров
		if ( chip.locus.name.substr(0, 5) == 'goods' && chip.locus.name != 'goods' ) {
			if ( chip.locus.parent.gamer.id != this.activeGamer ) return;
			if ( this.activeCube.value != 7 && chip.info.variant != this.activeCube.value ) return;

			gamer.sellGoods( chip.locus, true, event.clientX, event.clientY );

			return;
		}

		// взятие фишки с игрового поля
		if ( chip.locus.name.substr(0, 7) == 'advCube' ) {
			if ( gamer.freeAdvSlot() == null ) return;
			var arr = [];
			if (this.activeCube.value == 7) arr = [1, 2, 3, 4, 5, 6];
			else if ( gamer.knows('k12') ) {
				var p = this.activeCube.value + 1,
					m = this.activeCube.value - 1;
				if (p > 6) p -= 6;
				if (m < 1) m += 6;
				arr = [ this.activeCube.value, p, m ];
			} else arr = [ this.activeCube.value ];

			var index = arr.indexOf( chip.locus.cube );
			if ( index == -1 ) return;

			gamer.getChip(chip);
			
			return;
		}

		// поиск вариантов для введения фишки в вотчину
		if ( chip.locus.name.substr(0, 7) == 'advWait' && chip.locus.parent.gamer.id == this.activeGamer ) {
			gamer.tryFindPlace( chip );
		}
	}

	checkGetGoods(chip) {
		if (!chip.info) return;
		if ( chip.info.groupe != >>>Const.GROUPE_GOODS ) return;
		if ( chip.locus.parent !== this.field ) return;

		var gamer = this.gamer();

		if ( gamer.dowbleGoods == 1 ) {
			var old = +gamer.goodsUsed,
				now = +chip.locus.name[5],
				m = old - 1,
				p = old + 1;
			if (m < 1) m += 6;
			if (p > 6) p -= 6;

			if ( now != p && now != m ) return;
		}

		gamer.getGoods(chip);
	}

	checkTrade(chip, event) {
		if (!chip.info) return;
		if ( chip.info.groupe != >>>Const.GROUPE_GOODS ) return;
		

		var gamer = this.gamer();
		if ( chip.locus.parent !== gamer.plan ) return;

		gamer.sellGoods( chip.locus, false, event.clientX, event.clientY );
	}

	checkGetChip(chip, groupes) {
		if (!chip.info) return;
		if ( chip.info.groupe > >>>Const.GROUPE_BUILDING ) return;
		if ( chip.locus.parent !== this.field ) return;
		if ( chip.locus.name.substr(0, 7) == 'advSell' ) return;

		var match = false;
		for (var i in groupes) {
			var index = groupes.indexOf( chip.info.groupe );
			if ( index != -1 ) { match = true; break; }
		}

		if (!match) return;

		this.gamer().getChip(chip);
	}

	checkSetChip(chip, event) {
		var gamer = this.gamer();

		if ( chip.name.substr(0, 6) == 'spirit' ) {
			var locName = chip.name.split('.')[1],
				loc = gamer.plan.locus[locName],
				chip = this.world.getSpiritInitiator();

			this.world.clearSpiritStaff();
			gamer.applyChip(chip, loc, event.clientX, event.clientY);
			return;
		}


		if (!chip.info) return;
		if ( chip.locus.parent !== gamer.plan ) return;
		if ( chip.locus.name.substr(0, 7) != 'advWait' ) return;

		this.activeCube = { value : 7 };
		gamer.tryFindPlace( chip );
	}
}

function __prepateEventSupervisor(self) {
	self.eventSupervisor = new lx.LocalEventSupervisor();
	/*
	События:
		- cofb_status_changed
		- cofb_gamer_activated
		- cofb_chip_clicked
		- cofb_active_cube_changed
		- cofb_gamer_move_ends
		- cofb_game_over
	*/

	self.eventSupervisor.subscribe({
		cofb_status_changed: [self, self.onStatusChange],
		cofb_chip_clicked: [self, self.checkChipClick],
		cofb_active_cube_changed: ()=>self.pulsator.on()
	});

	var plugin = self.getPlugin();
	self.eventSupervisor.subscribe('cofb_game_over', function(gamer) {
		plugin->>confirmPopup.open('Игра окончена. Хотите посмотреть таблицу очков?', ()=>{
			plugin->>scoreTable.open();
		});
	});

	// Подсказка что делать в данный момент
	let hintBox = plugin->>lblHint;
	self.eventSupervisor.subscribe('cofb_status_changed', function(status) {
		switch (status) {
			case >>>Const.STATUS_PHASE_ACTIVATE:
				hintBox.text('Кликните по товарам фазы, чтобы начать');
			break;
			case >>>Const.STATUS_PLAY_OUT_CUBES:
				hintBox.text('Разыграйте кубики - кликните любой'); 
			break;
		}
	});
	self.eventSupervisor.subscribe('cofb_gamer_activated', function(gamer) {
		hintBox.text('Ходит игрок ' + gamer.getName());
	});

	// Сообщение о том, что ход закончился, кликабелен для передачи хода другому игроку
	let turnEndsBox = plugin->>lblTurnEnds;
	self.eventSupervisor.subscribe('cofb_gamer_move_ends', function(gamer) {
		turnEndsBox.show();
	});

	// Иконка, сопровождающая мышь, показывающая какое сейчас совершается действие
	let statusIcon = plugin->>statusIcon;
	self.eventSupervisor.subscribe('cofb_active_cube_changed', function(newValue) {
		statusIcon.picture('cube' + newValue + '.jpg');
	});
	self.eventSupervisor.subscribe('cofb_status_changed', function(newStatus, data = {}) {
		if (self.status.isPending()) {
			statusIcon.hide();
			return;
		}
		
		if (self.gamer() && self.gamer().AI) return;

		switch (true) {
			case self.status.isGetGoods() :
				statusIcon.start(data.dowble?'getGoods2.png':'getGoods.png');
			break;
			case self.status.isUseCube():
				statusIcon.start((data.value==7)?'cubeJoker.jpg':'cube'+data.value+'.jpg', data.event);
				break;
			case self.status.isUseSilver(data.event):
				statusIcon.start('silver.jpg', data.event);
				break;
			case self.status.isTrade():
				statusIcon.start('trade.png');
			break;
			case self.status.isGetBuilding():
				statusIcon.start('getBuilding.png');
			break;
			case self.status.isGetMCK():
				statusIcon.start('getMCK.png');
			break;
			case self.status.isGetAS():
				statusIcon.start('getAS.png');
			break;
			case self.status.isSetChip():
				statusIcon.start('setChip.png');
			break;
		}
	});
}

function __prepareField(self) {
	self.field = new lexedo.games.Cofb.Field(self);
	self.cube = new lexedo.games.Cofb.Cube(self, -1, 0);
	self.field.locus['cube'].locate( self.cube );
}

function __preparePacks(self) {
	self.packs.init();
	self.packs.shuffle();
}
