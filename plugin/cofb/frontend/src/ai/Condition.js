#lx:macros Const {lexedo.games.Cofb.Constants};
#lx:macros aiConst {lexedo.games.Cofb.AI.AI};

class Condition #lx:namespace lexedo.games.Cofb.AI {
	constructor(ai = null) {
		this.ai = ai;
		this.parent = null;
		this.reason = null;
		this.actions = [];
		this.immediately = null;

		this.usefullActionIndex = 0;
		this.ends = [];

		// plan
		this.silverUsed = false;
		this.cubes = [0, 0];
		this.cubeJoker = [];
		this._barony = [];
		this.advWait = [0, 0, 0];  // {groupe, variant}
		this.workers = 0;
		this.silver = 0;
		this.goods = [0, 0, 0];  // {amt, cube}
		this._knows = [];

		// field
		this._advCube = [];  // {groupe, variant}
		this._advSell = [];  // {groupe, variant}
		this._fieldGoods = null;  // [ variant ]
	}

	getGame() {
		return this.ai.game;
	}

	root() {
		return this.ai.conditionsTree;
	}

	initCore(gamer) {
		this.silverUsed = gamer.silverUsed;

		var locus = gamer.plan.locus;

		if (locus['cube0'].chips.length) this.cubes[0] = locus['cube0'].chips[0].value;
		if (locus['cube1'].chips.length) this.cubes[1] = locus['cube1'].chips[0].value;
		if (locus['cubeJoker'].chips.length)
			for (var i in locus['cubeJoker'].chips) this.cubeJoker.push(7);

		for (var i=0; i<37; i++) {
			var l = locus['advLoc' + i];
			if (l.chips.length) {
				var info = l.chips[0].info;
				this._barony['b' + i] = info.variant;
			}
		}

		for (var i=0; i<3; i++)
			if (locus['advWait' + i].chips.length) {
				var info = locus['advWait' + i].chips[0].info;
				this.advWait[i] = { groupe : info.groupe, variant : info.variant };
			}

		this.workers = locus['worker'].chips.length;
		this.silver = locus['silver'].chips.length;

		for (var i=0; i<3; i++)
			if (locus['goods' + i].chips.length) { this.goods[i] = { amt : locus['goods' + i].chips.length, cube : locus['goods' + i].chips[0].info.variant } }

		for (var i in gamer.knowledges) this._knows[i] = gamer.knowledges[i];

		this._fieldGoods = [];
		for (var i in this.getGame().field.locus) {
			var l = this.getGame().field.locus[i],
				name = l.name,
				subname = name.substr(0, 5);

			if (!l.chips.length) continue;

			if (subname == 'advCu') {
				this._advCube[ i ] = { groupe : l.chips[0].info.groupe, variant : l.chips[0].info.variant };
			} else if (subname == 'advSe') {
				this._advSell[ i ] = { groupe : l.chips[0].info.groupe, variant : l.chips[0].info.variant };
			} else if (subname == 'goods') {
				this._fieldGoods[ i ] = [];
				for (var j in l.chips) this._fieldGoods[ i ].push( l.chips[j].info.variant );
			}
		}
	}

	freeSlot() {
		var result = -1;
		for (var i=0; i<3; i++) if (this.advWait[i] == 0) return i;
		return result;
	}

	findPlace(barony, knows, groupe, variant, nums) {
		var locs = [],
			plan = this.getGame().gamers[ this.getGame().gamerKeys[0] ].plan,
			baronyLocus = plan.locus;

		for (var i=0; i<37; i++) {
			var name = 'advLoc' + i,
				key = 'b' + i;

			if ( key in barony ) continue;

			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
			//console.log( 'findPlace ', name, baronyLocus[name].groupe, groupe, variant );


			if (baronyLocus[name].groupe != groupe) continue;
			var index = nums.indexOf( baronyLocus[name].cube );
			if (index == -1) continue;

			var neib = plan.advLocNeiborNums(i);
			var fill = false;
			for (var j in neib) if ( 'b' + neib[j] in barony ) { fill = true; break; }
			if (!fill) continue;

			if ( groupe == >>>Const.GROUPE_BUILDING && !('k1' in knows) ) {
				var area = plan.areaNums(i);

				var match = false;
				for (var j in area) {
					if ( ('b' + area[j] in barony) && barony['b' + area[j]] == variant)
						{ match = true; break; }
				}

				if (match) continue;
			}

			locs.push(i);
		}

		return locs;
	}

	locateGoods(goods) {
		var map = [-1, -1, -1];
		for (var i in map) {
			if ( this.goods[i] == 0 ) continue;
			map[i] = this.goods[i].cube;
		}

		var sortGoods = [[], [], []];
		for (var i in goods) {
			var sorted = false;
			for (var j in map) {
				if (goods[i] == map[j]) { sortGoods[j].push(i); sorted = true; }
			}

			if (!sorted)
				for (var j in map) if (map[j] == -1) {
					map[j] = goods[i];
					sortGoods[j].push(i);
					break;
				}
		}
		return sortGoods;
	}

	checkSortGoodsEmpty(goods) {
		return ( !goods[0].length && !goods[1].length && !goods[2].length );
	}

	findActions() {
		function cubePM(num) {
			var p = num + 1,
				m = num - 1;
			if (p > 6) p -= 6;
			if (m < 1) m += 6;
			return [ m, num, p ];
		} 

		var root = this.root();
		this.actions = [];

		var freeSlot = this.freeSlot(),
			advCube = this.advCube(),
			barony = this.barony(),
			knows = this.knows();

		// заполнение для каждой группы
		var groupeFill = this.ai.groupeFilled(barony),
			groupeAmt = groupeFill.amount,
			groupeFilled = groupeFill.filled,
			groupePart = groupeFill.part,
			areasFilled = this.ai.areasFilled(barony),
			freeNeibors = this.ai.freeNeibors(barony),
			map = this.ai.planMap['g' + this.ai.gamer.id],
			plan = this.ai.gamer.plan;

		var groupeNeibAmt = [0, 0, 0, 0, 0, 0];
		for (var i in freeNeibors) {
			groupeNeibAmt[ plan.locus[ 'advLoc' + freeNeibors[i] ].groupe ]++;
		}

		var ctx = this,
			_ai = this.ai,
			_game = this.getGame();

		// для взятия фишки нужно ориентироваться на группу: долю заполненности цвета, количества в соседях, ЗНАНИЯ
		function getChipUsefullIndex(groupe, variant) {
			var grAmt = groupeFilled[ groupe ];
			for (var i=0; i<3; i++)
				if ( ctx.advWait[i].groupe == groupe ) grAmt++;
			if ( grAmt == groupeAmt[groupe] ) return -100;

			// здания с учетом повторения в городах
			if ( groupe == >>>Const.GROUPE_BUILDING && !('k1' in knows) ) {
				var free = false;
				for (var i in map) {
					var contains = false;
					for (var j in map[i].cells)
						if ( barony[ 'b' + map[i].cells[j] ] == variant )
							{ contains = true; break; }
					if (!contains) { free = true; break; }
				}

				if (!free) return -100;
			}

			// базовый коэффициент по заполненности цвета и количества потенциальных вариантов размещения
			var k = 1 + groupePart[groupe] * 1.7 + groupeNeibAmt[groupe] * 0.25;

			// рудники с учетом знаний
			if ( groupe == >>>Const.GROUPE_MINE ) {
				k += ( 5 - _game.phase ) * 0.5;
				if ('k2' in knows) k += 0.5;
			}

			// здания с учетом знаний
			if ( groupe == >>>Const.GROUPE_BUILDING ) {
				if ( variant == >>>Const.VARIANT_BUILDING_TRADEPOST && ('k16' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_WATCHTOWER && ('k17' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_SAWMILL && ('k18' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_CHURCH && ('k19' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_MARKET && ('k20' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_HOTEL && ('k21' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_BANK && ('k22' in knows) ) k += 0.5;
				else if ( variant == >>>Const.VARIANT_BUILDING_TOWNHALL && ('k23' in knows) ) k += 0.5;
			}

			// животные с учетом знаний
			if ( groupe == >>>Const.GROUPE_ANIMAL ) {
				var animals = [0, 0, 0, 0];

				for (var i in map) for (var j in map[i].cells) {
					var num = map[i].cells[j],
						gr = plan.locus['advLoc' + num].groupe;
					if ( gr == >>>Const.GROUPE_ANIMAL ) 
						animals[ Math.floor((barony[ 'b' + num ] - 29) / 3) ]++;
				}

				var animalsAmt = 0, animalsTotal = 0;
				for (var i in animals) if (animals[i]) {
					animalsAmt++;
					animalsTotal += animals[i];
				}

				var coGroupe = animals[ Math.floor((variant - 29) / 3) ];

				if ( 'k24' in knows && coGroupe == 0 ) k += 1;
				if ( 'k7' in knows ) k += 0.25;

				k += coGroupe * 0.5;
			}

			// знания
			if ( groupe == >>>Const.GROUPE_KNOWLEGE ) {
				k += 0.15;

				var buildings = [0, 0, 0, 0, 0, 0, 0, 0],
					animals = [0, 0, 0, 0],
					mines = 0,
					ships = 0;

				for (var i in map) for (var j in map[i].cells) {
					var num = map[i].cells[j],
						gr = plan.locus['advLoc' + num].groupe;
					if ( gr == >>>Const.GROUPE_BUILDING )
						buildings[ barony[ 'b' + num ] - 41 ]++;
					else if ( gr == >>>Const.GROUPE_ANIMAL ) 
						animals[ Math.floor((barony[ 'b' + num ] - 29) / 3) ]++;
					else if ( gr == >>>Const.GROUPE_MINE )
						mines++;
					else if ( gr == >>>Const.GROUPE_SHIP )
						ships++;
				}

				var animalsAmt = 0, animalsTotal = 0;
				for (var i in animals) if (animals[i]) {
					animalsAmt++;
					animalsTotal += animals[i];
				}

				if ( variant == >>>Const.VARIANT_KNOWLEDGE_2 ) k += mines * 0.4;

				if ( variant == >>>Const.VARIANT_KNOWLEDGE_16 ) k += buildings[ >>>Const.VARIANT_BUILDING_TRADEPOST - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_17 ) k += buildings[ >>>Const.VARIANT_BUILDING_WATCHTOWER - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_18 ) k += buildings[ >>>Const.VARIANT_BUILDING_SAWMILL - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_19 ) k += buildings[ >>>Const.VARIANT_BUILDING_CHURCH - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_20 ) k += buildings[ >>>Const.VARIANT_BUILDING_MARKET - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_21 ) k += buildings[ >>>Const.VARIANT_BUILDING_HOTEL - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_22 ) k += buildings[ >>>Const.VARIANT_BUILDING_BANK - 41 ] * 0.4;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_23 ) k += buildings[ >>>Const.VARIANT_BUILDING_TOWNHALL - 41 ] * 0.4;

				if ( variant == >>>Const.VARIANT_KNOWLEDGE_24 ) k += animalsAmt * 0.75;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_7 ) k += ( 3 - animalsTotal * 0.5 );

				if ( variant == >>>Const.VARIANT_KNOWLEDGE_3 ) k += ( 4 - ships * 0.75 );
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_4 ) k += ( 3 - ships * 0.5 );
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_5 ) k += ( 4 - ships * 0.75 );
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_15 ) k += 3;
				if ( variant == >>>Const.VARIANT_KNOWLEDGE_25 ) k += 3;
			}

			// лодки
			if ( groupe == >>>Const.GROUPE_SHIP ) {
				k += 0.25;  // на порядок хода

				var emptyGoods = 0;
				for (var i in ctx.goods) if (ctx.goods[i] == 0) emptyGoods++;
				if (emptyGoods == 1) k += 0.25;
				else if (emptyGoods == 2) k += 0.5;
				else if (emptyGoods == 3) k += 1;

				if ('k3' in knows) k += 0.25;
				if ('k4' in knows) k += 0.1;
				if ('k5' in knows) k += 0.25;
				if ('k15' in knows) k += 0.25;
				if ('k25' in knows) k += 0.25;
			}

			return k;
		}

		// для выкладывания фишки нужно ориентироваться на долю заполненности области
		function setChipUsefullIndex(groupe, variant, dest) {
			var k = 1 + groupePart[groupe],
				index = _ai.areaIndex(dest),
				filled = areasFilled[ index ];

			k += filled + 1 / map[index].cells.length;

			if (groupe == >>>Const.GROUPE_KNOWLEGE) {
				switch (variant) {
					case >>>Const.VARIANT_KNOWLEDGE_25 : k += 0.25 * _game.gamer().plan.locus['goods'].chips.length; break;
					case >>>Const.VARIANT_KNOWLEDGE_15 : k += 0.3 * _game.gamer().plan.locus['goods'].chips.length; break;
				}
			}

			return k * 1.7;
		}

		if (this.immediately != null) {

			switch (this.immediately) {
				case >>>Const.STATUS_GET_GOODS : {
					var fieldGoods = this.fieldGoods();

					var map = [0, 0, 0, 0, 0, 0];
					for (var i in fieldGoods) map[ +i[5] - 1 ] = 1;

					for (var i=0; i<6; i++) {
						if ( map[i] == 0 ) continue;

						var goods = [], fromArr = [ 'goods' + (i+1) ];
						for ( var j in fieldGoods['goods' + (i+1)] ) {
							goods.push( fieldGoods['goods' + (i+1)][j] );
						}

						if ('k5' in knows) {
							var ip = ( +i == 5 ) ? 0 : +i+1;
							if ( map[ip] != 0 ) {
								for ( var j in fieldGoods['goods' + (ip+1)] )
									goods.push( fieldGoods['goods' + (ip+1)][j] );
							}
							fromArr.push( 'goods' + (ip+1) );
						}

						var sortGoods = this.locateGoods(goods);
						if ( !this.checkSortGoodsEmpty(sortGoods) ) {
							var k = 1 + 0.15 * goods.length + 0.05 * (goods.length - 1);
							var kk = 1;
							if ('k3' in knows) kk += 0.2;
							if ('k4' in knows) kk += 0.1;
							if ('k15' in knows) kk += 0.2;
							if ('k25' in knows) kk += 0.2;
							if ('k5' in knows) kk += 0.3;
							k *= kk;
							this.actions.push({ type:>>>aiConst.GET_GOODS, from: fromArr, usefullIndex : k });
						}
					}
				} break;

				case >>>Const.STATUS_TRADE : {
					for (var i in this.goods) {
						if ( this.goods[i] == 0 ) continue;
						var k = 1 + 0.1 * this.goods[i].amt;
						var kk = 1;
						if ('k3' in knows) kk += 0.2;
						if ('k4' in knows) kk += 0.1;
						if ('k15' in knows) kk += 0.2;
						if ('k25' in knows) kk += 0.2;
						k *= kk;
						this.actions.push({ type:>>>aiConst.SELL_GOODS, by:-2, from:i, usefullIndex : k });
					}
				} break;

				case >>>Const.STATUS_GET_BUILDING : {
					if (freeSlot != -1) for (var i in advCube) {
						if ( advCube[i].groupe == >>>Const.GROUPE_BUILDING ) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

							this.actions.push({ type:>>>aiConst.GET_CHIP, by:-2, from:i, to:freeSlot, usefullIndex : k });
						}
					}
				} break;

				case >>>Const.STATUS_GET_MCK : {
					if (freeSlot != -1) for (var i in advCube) {
						var gr = advCube[i].groupe;
						if ( gr == >>>Const.GROUPE_MINE || gr == >>>Const.GROUPE_CASTLE || gr == >>>Const.GROUPE_KNOWLEGE  ) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

							this.actions.push({ type:>>>aiConst.GET_CHIP, by:-2, from:i, to:freeSlot, usefullIndex : k });
						}
					}
				} break;

				case >>>Const.STATUS_GET_AS : {
					if (freeSlot != -1) for (var i in advCube) {
						var gr = advCube[i].groupe;
						if ( gr == >>>Const.GROUPE_ANIMAL || gr == >>>Const.GROUPE_SHIP ) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

							this.actions.push({ type:>>>aiConst.GET_CHIP, by:-2, from:i, to:freeSlot, usefullIndex : k });
						}
					}
				} break;

				case >>>Const.STATUS_SET_CHIP : {
					for (var i in this.advWait) {
						if ( this.advWait[i] == 0 ) continue;

						var groupe = this.advWait[i].groupe,
							variant = this.advWait[i].variant,
							nums = [1, 2, 3, 4, 5, 6];

						var locs = this.findPlace(barony, knows, groupe, variant, nums);
						for (var j in locs) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( groupe, variant, locs[j] );
						
							this.actions.push({ type:>>>aiConst.SET_CHIP, by:-2, from:i, to:locs[j], usefullIndex : k });
						}
					}
				} break;
			}
			return;	
		}

		// купить за серебро
		if (!this.silverUsed && this.silver >= 2 && freeSlot != -1) {
			var advSell = this.advSell();

			for (var i in advSell) {
				// рассчет индекса полезности
				var k = getChipUsefullIndex( advSell[i].groupe, advSell[i].variant );

				this.actions.push({ type:>>>aiConst.GET_CHIP, by:-1, from:i, to:freeSlot, usefullIndex : k });
			}

			if ('k6' in knows) for (var i in this.advCube) {
				// рассчет индекса полезности
				var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

				this.actions.push({ type:>>>aiConst.GET_CHIP, by:-1, from:i, to:freeSlot, usefullIndex : k });
			}
		}

		// взять фишку с поля
		if (freeSlot != -1) {
			var nums0 = [ this.cubes[0] ],
				nums1 = [ this.cubes[1] ];

			if ('k12' in knows) {
				nums0 = cubePM( this.cubes[0] );
				nums1 = cubePM( this.cubes[1] );
			}

			for (var i in advCube) {
				var cube = +i[7];

				var index = nums0.indexOf( cube );
				if (index != -1) {
					// рассчет индекса полезности
					var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

					this.actions.push({ type:>>>aiConst.GET_CHIP, by:0, from:i, to:freeSlot, usefullIndex : k });
				}

				if ( this.cubes[1] != this.cubes[0] ) {
					var index = nums1.indexOf( cube );
					if (index != -1) {
						// рассчет индекса полезности
						var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

						this.actions.push({ type:>>>aiConst.GET_CHIP, by:1, from:i, to:freeSlot, usefullIndex : k });
					}
				}

				if (this.cubeJoker.length) {
					// рассчет индекса полезности
					var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

					this.actions.push({ type:>>>aiConst.GET_CHIP, by:2, from:i, to:freeSlot, usefullIndex : k });
				}
			}
		}

		// ввести фишку в вотчину
		for (var i in this.advWait) {
			if ( this.advWait[i] == 0 ) continue;

			var groupe = this.advWait[i].groupe,
				variant = this.advWait[i].variant;

			var nums0 = [ this.cubes[0] ],
				nums1 = [ this.cubes[1] ];

			if ( ('k9' in knows && groupe == >>>Const.GROUPE_BUILDING) 
			|| ( 'k10' in knows && (groupe == >>>Const.GROUPE_ANIMAL || groupe == >>>Const.GROUPE_SHIP) )
			|| ( 'k11' in knows && (groupe == >>>Const.GROUPE_MINE || groupe == >>>Const.GROUPE_CASTLE || groupe == >>>Const.GROUPE_KNOWLEGE) ) ) {
				nums0 = cubePM( this.cubes[0] );
				nums1 = cubePM( this.cubes[1] );
			}

			var locs = this.findPlace(barony, knows, groupe, variant, nums0);
			for (var j in locs) {
				// рассчет индекса полезности
				var k = setChipUsefullIndex(groupe, variant, locs[j]);

				this.actions.push({ type:>>>aiConst.SET_CHIP, by:0, from:i, to:locs[j], usefullIndex : k });
			}

			if ( this.cubes[1] != this.cubes[0] ) {
				var locs = this.findPlace(barony, knows, groupe, variant, nums1);
				for (var j in locs) {
					// рассчет индекса полезности
					var k = setChipUsefullIndex(groupe, variant, locs[j]);

					this.actions.push({ type:>>>aiConst.SET_CHIP, by:1, from:i, to:locs[j], usefullIndex : k });
				}
			}

			if (this.cubeJoker.length) {
				var nums = [1, 2, 3, 4, 5, 6];
				var locs = this.findPlace(barony, knows, groupe, variant, nums);
				for (var j in locs) {
					// рассчет индекса полезности
					var k = setChipUsefullIndex(groupe, variant, locs[j]);

					this.actions.push({ type:>>>aiConst.SET_CHIP, by:2, from:i, to:locs[j], usefullIndex : k });
				}
			}
		}

		// использование рабочего
		if (this.workers != 0) {
			var baseCubes = root.cubes,
				p0 = false,
				m0 = false,
				p1 = false,
				m1 = false;

			if ( this.parent != null ) {
				var pB = this.parent.cubes[0] + 1;
				if (pB > 6) pB = 1;
				var mP = this.parent.cubes[0] - 1;
				if (mP < 1) mP = 6;
				if (this.cubes[0] == pB) p0 = true;
				if (this.cubes[0] == mP) m0 = true;

				var pB = this.parent.cubes[1] + 1;
				if (pB > 6) pB = 1;
				var mP = this.parent.cubes[1] - 1;
				if (mP < 1) mP = 6;
				if (this.cubes[1] == pB) p1 = true;
				if (this.cubes[1] == mP) m1 = true;
			}

			if ( this.cubes[0] != 0 && this.cubes[0] + 3 != baseCubes[0] && this.cubes[0] - 3 != baseCubes[0] ) {
				if (!p0) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:0, shift:-1, usefullIndex : 0 });
				if (!m0) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:0, shift: 1, usefullIndex : 0 });
			}
			if ( this.cubes[1] && this.cubes[1] + 3 != baseCubes[1] && this.cubes[1] - 3 != baseCubes[1] ) {
				if (!p1) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:1, shift:-1, usefullIndex : 0 });
				if (!m1) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:1, shift: 1, usefullIndex : 0 });
			}

			if ('k8' in knows) {
				if ( this.cubes[0] && this.cubes[0] + 2 != baseCubes[0] && this.cubes[0] - 2 != baseCubes[0] ) {
					if (!p0) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:0, shift:-2, usefullIndex : 0 });
					if (!m0) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:0, shift: 2, usefullIndex : 0 });
				}
				if ( this.cubes[1] && this.cubes[1] + 2 != baseCubes[1] && this.cubes[1] - 2 != baseCubes[1] ) {
					if (!p1) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:1, shift:-2, usefullIndex : 0 });
					if (!m1) this.actions.push({ type:>>>aiConst.USE_WORKER, cube:1, shift: 2, usefullIndex : 0 });
				}
			}
		}

		// обмен на рабочего
		if (this.cubes[0] != 0) this.actions.push({ type:>>>aiConst.GET_WORKER, by:0, usefullIndex : 0 });
		if (this.cubes[1] != 0) this.actions.push({ type:>>>aiConst.GET_WORKER, by:1, usefullIndex : 0 });
		if (this.cubeJoker.length) this.actions.push({ type:>>>aiConst.GET_WORKER, by:2, usefullIndex : 0 });

		// продажа товара
		for (var i in this.goods) {
			if ( this.goods[i] == 0 ) continue;
			var cube = this.goods[i].cube;

			var k = 1 + 0.1 * this.goods[i].amt;
			var kk = 1;
			if ('k3' in knows) kk += 0.2;
			if ('k4' in knows) kk += 0.1;
			if ('k15' in knows) kk += 0.2;
			if ('k25' in knows) kk += 0.2;
			k *= kk;

			if ( cube == this.cubes[0] ) this.actions.push({ type:>>>aiConst.SELL_GOODS, by:0, from:i, usefullIndex : k });
			if ( this.cubes[1] != this.cubes[0] && cube == this.cubes[1] ) this.actions.push({ type:>>>aiConst.SELL_GOODS, by:1, from:i, usefullIndex : k });
			if (this.cubeJoker.length) this.actions.push({ type:>>>aiConst.SELL_GOODS, by:2, from:i, usefullIndex : k });
		}
	}

	setParent(cond) {
		this.parent = cond;
		this.ai = this.parent.ai;

		this.silverUsed = cond.silverUsed;
		this.cubes = [ cond.cubes[0], cond.cubes[1] ];
		for (var i in cond.cubeJoker) this.cubeJoker[i] = cond.cubeJoker[i];
		for (var i in cond.advWait) this.advWait[i] = cond.advWait[i];
		this.workers = cond.workers;
		this.silver = cond.silver;
		for (var i in cond.goods) this.goods[i] = cond.goods[i];
	}

	barony() {
		if (this.parent == null) return this._barony;
		var b = [], pb = this.parent.barony();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._barony) b[i] = this._barony[i];
		return b;
	}

	knows() {
		if (this.parent == null) return this._knows;
		var b = [], pb = this.parent.knows();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._knows) b[i] = this._knows[i];
		return b;
	}

	advCube() {
		if (this.parent == null) return this._advCube;
		var b = [], pb = this.parent.advCube();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._advCube) delete b[i];
		return b;
	}

	advSell() {
		if (this.parent == null) return this._advSell;
		var b = [], pb = this.parent.advSell();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._advSell) delete b[i];
		return b;
	}

	fieldGoods() {
		if ( this._fieldGoods == null ) return this.parent.fieldGoods();
		return this._fieldGoods;
	}
}
