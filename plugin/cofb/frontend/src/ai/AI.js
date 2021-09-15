#lx:macros Const {lexedo.games.Cofb.Constants};
#lx:macros aiConst {lexedo.games.Cofb.AI.AI};

class AI #lx:namespace lexedo.games.Cofb.AI {
	#lx:const
		GET_CHIP = 0,
		SET_CHIP = 1,
		GET_GOODS = 2,
		SELL_GOODS = 3,
		GET_WORKER = 4,
		USE_WORKER = 5;

	constructor(game) {
		this.game = game;
		this.gamer = null;
		this.conditionCounter = 0;
		this.conditionsTree = null;
		this.actions = [];
		this.active = false;
		this.planMap = [];
	}

	genConditionsTree() {
		function useBy(cond, by) {
			if (by == -1) { cond.silver -= 2; cond.silverUsed = true; }
			if (by == 0) cond.cubes[0] = 0;
			if (by == 1) cond.cubes[1] = 0;
			if (by == 2) cond.cubeJoker.pop();
		}

		this.conditionsTree = new lexedo.games.Cofb.AI.Condition(this);
		this.conditionsTree.initCore( this.gamer );

		this.conditionCounter = 1;

		var _ai = this;
		function rec( ctx ) {
			ctx.findActions();
			if (!ctx.actions.length) _ai.conditionsTree.ends.push( ctx );

			// console.log( '!!!' );

			var amt;
			if ( ctx.immediately ) amt = ctx.actions.length;
			else amt = Math.floor( 2000 / _ai.conditionCounter );
			var indexes = lx.Math.selectRandomKeys( ctx.actions, amt );

			for (var i in indexes) {
				var act = ctx.actions[ indexes[i] ];

				var knows = ctx.knows();

				// формируем новую реальность под каждое отдельное действие
				_ai.conditionCounter++;
				var newCond = new lexedo.games.Cofb.AI.Condition();
				newCond.setParent( ctx );
				newCond.reason = act;
				newCond.usefullActionIndex = ctx.usefullActionIndex + act.usefullIndex;

				// применяем к новой реальности изменения, вызванные действием
				switch ( act.type ) {
					case >>>aiConst.GET_CHIP : {
						useBy( newCond, act.by );
						var info = _ai.game.field.tyles[act.from].chips[0].info;
						newCond.advWait[act.to] = { groupe : info.groupe, variant : info.variant };

						// console.log( newCond );
					} break;

					case >>>aiConst.SET_CHIP : {
						useBy( newCond, act.by );

						var groupe = newCond.advWait[ act.from ].groupe,
							variant = newCond.advWait[ act.from ].variant;
						newCond._barony[ 'b' + act.to ] = variant;
						newCond.advWait[ act.from ] = 0;

						// группа животных для оценки
						// сторожевая башня для оценки

						switch (variant) {
							case >>>Const.VARIANT_SHIP : {
								var fieldGoods = newCond.fieldGoods();
								var find = false;
								for (var i in fieldGoods) { find = true; break; }
								if (find) newCond.immediately = >>>Const.STATUS_GET_GOODS;
							} break;
							case >>>Const.VARIANT_BUILDING_TRADEPOST : {
								if (newCond.goods[0] != 0 || newCond.goods[1] != 0 || newCond.goods[2] != 0)
									newCond.immediately = >>>Const.STATUS_TRADE;
							} break;
							case >>>Const.VARIANT_BUILDING_SAWMILL : {
								var advCube = newCond.advCube();
								var find = false;
								for (var i in advCube)
									if ( advCube[i].groupe == >>>Const.GROUPE_BUILDING ) { find = true; break; }
								if (find) newCond.immediately = >>>Const.STATUS_GET_BUILDING;
							} break;
							case >>>Const.VARIANT_BUILDING_CHURCH : {
								var advCube = newCond.advCube();
								var find = false;
								for (var i in advCube)
									if ( advCube[i].groupe == >>>Const.GROUPE_MINE || advCube[i].groupe == >>>Const.GROUPE_CASTLE || advCube[i].groupe == >>>Const.GROUPE_KNOWLEGE )
										{ find = true; break; }
								if (find) newCond.immediately = >>>Const.STATUS_GET_MCK;
							} break;
							case >>>Const.VARIANT_BUILDING_MARKET : {
								var advCube = newCond.advCube();
								var find = false;
								for (var i in advCube)
									if ( advCube[i].groupe == >>>Const.GROUPE_ANIMAL || advCube[i].groupe == >>>Const.GROUPE_SHIP ) { find = true; break; }
								if (find) newCond.immediately = >>>Const.STATUS_GET_AS;
							} break;
							case >>>Const.VARIANT_BUILDING_TOWNHALL : {
								if ( newCond.advWait[0] != 0 || newCond.advWait[1] != 0 || newCond.advWait[2] != 0 )
									newCond.immediately = >>>Const.STATUS_SET_CHIP;
							} break;
							case >>>Const.VARIANT_CASTLE : { newCond.cubeJoker.push(7); } break;
							case >>>Const.VARIANT_BUILDING_HOTEL : { newCond.workers += 4; } break;
							case >>>Const.VARIANT_BUILDING_BANK : { newCond.silver += 2; } break;
						}

						// console.log( newCond );
					} break;

					case >>>aiConst.GET_GOODS : {
						// console.log( 'action GET_GOODS' );

						var fieldGoods = newCond.fieldGoods();

						var fg = [];
						for (var i in fieldGoods) {
							fg[i] = fieldGoods[i];
							for (var j in fieldGoods[i])
								fg[i][j] = fieldGoods[i][j];
						}
						newCond._fieldGoods = fg;

						var from = act.from;

						for (var i in from) {
							var name = from[i];

							var l = newCond._fieldGoods[name].length - 1;
							for (var j=l; j>=0; j--) {
								var goods = newCond._fieldGoods[name][j];

								var located = false;
								for (var g in newCond.goods) {
									if ( newCond.goods[g] != 0 && newCond.goods[g].cube == goods ) {
										newCond.goods[g].amt++;
										newCond._fieldGoods[name].splice(j, 1);
										located = true;
									}
								}
								if (!located) for (var g in newCond.goods) {
									if (newCond.goods[g] == 0) {
										newCond.goods[g] = { cube : goods, amt : 1 };
										newCond._fieldGoods[name].splice(j, 1);
										break;
									}
								}
							}
						}

						// console.log( newCond );
					} break;

					case >>>aiConst.SELL_GOODS : {
						newCond.goods[ act.from ] = 0;
						useBy( newCond, act.by );
						newCond.silver++;
						if ('k3' in knows) newCond.silver++;
						if ('k4' in knows) newCond.workers++;

						// console.log( newCond );
					} break;

					case >>>aiConst.GET_WORKER : {
						useBy( newCond, act.by );
						newCond.workers += 2;
						if ('k13' in knows) newCond.silver += 1;
						if ('k14' in knows) newCond.workers += 2;

						// console.log( newCond.workers, newCond.cubes );
					} break;

					case >>>aiConst.USE_WORKER : {
						newCond.workers--;
						newCond.cubes[ act.cube ] += act.shift;
						if ( newCond.cubes[ act.cube ] > 6 ) newCond.cubes[ act.cube ] -= 6;
						if ( newCond.cubes[ act.cube ] < 1 ) newCond.cubes[ act.cube ] += 6;
					} break;
				}
			
				// ветвим новую реальность согласно ее возможным событиям
				rec( newCond );


				// console.log( '---' );
				// console.log( newCond.reason );
			}
		}

		rec( this.conditionsTree );

		this.conditionsTree.ends.sort(
			function(a, b) {
				if ( a.usefullActionIndex > b.usefullActionIndex ) return -1;
				if ( a.usefullActionIndex < b.usefullActionIndex ) return 1;
				return 0;
			}
		);
	}


	delConditionsTree() {
		delete this.conditionsTree;
	}

	genPlanMap() {
		if ( 'g' + this.gamer.id in this.planMap ) return;

		var arr = [];

		for (var i=0; i<37; i++) {

			var located = false;
			for (var j in arr) if ( arr[j].contains(i) ) { located = true; break; }
			if (located) continue;

			var area = new lexedo.games.Cofb.AI.Area();
			area.cells = this.gamer.plan.areaNums(i);
			area.groupe = this.gamer.plan.tyles['advLoc' + i].groupe;

			arr.push(area);
		}

		this.planMap[ 'g' + this.gamer.id ] = arr;
	}

	freeNeibors(barony) {
		var arr = [];

		for (var i=0; i<37; i++) {

			var key = 'b' + i;

			var neib = [];
			if (key in barony) neib = this.gamer.plan.advLocNeiborNums(i);

			for (var j in neib)
				if ( !('b'+j in barony) ) arr['n' + neib[j]] = neib[j];
		}

		return arr;
	}

	groupeFilled(barony) {
		var result = [0, 0, 0, 0, 0, 0],
			amt = [0, 0, 0, 0, 0, 0],
			fill = [0, 0, 0, 0, 0, 0],
			plan = this.gamer.plan;

		for (var i=0; i<37; i++) {
			var gr = plan.tyles['advLoc' + i].groupe;
			amt[gr]++;
			if ( ('b' + i) in barony ) fill[gr]++;
		}

		fill[>>>Const.GROUPE_CASTLE]--;
		amt[>>>Const.GROUPE_CASTLE]--;

		for (var i in result) result[i] = fill[i] / amt[i];

		return { amount : amt, filled : fill, part : result };
	}

	areasFilled(barony) {
		var map = this.planMap['g' + this.gamer.id];

		var result = [];

		for (var i in map) {
			var area = map[i];
			result.push(0);

			for (var j in area.cells)
				if ( 'b' + area.cells[j] in barony )
					result[i]++;

			result[i] = result[i] / area.cells.length;
		}

		return result;
	}

	areaIndex(num) {
		var map = this.planMap['g' + this.gamer.id];

		for (var i in map)
			if (map[i].contains(num)) return i;

		return -1;
	}

	setGamer(gamer) {

		console.log( 'setGamer' );

		this.gamer = gamer;
		this.genPlanMap();

		// если не активен, становится активен, создает дерево состояний, выбирает матрицу событий, начинает по ней идти
		if (!this.active) {
			console.log('activate ==========================================');
			this.active = true;
			this.genConditionsTree();

			var end = this.conditionsTree.ends[0];

			while ( end.parent != null ) {
				this.actions.push(end);
				end = end.parent;
			}

			this.actions[ this.actions.length - 1 ].parent = null;
			this.delConditionsTree();

			for (var i in this.actions)
				console.log( JSON.stringify( this.actions[i].reason ) );
		}

		// если активен - если есть действия в очереди, делает верхнее, удаляя из очереди. Если очередь пуста - становится неактивен, передает ход
		if (this.active) {

			if ( !this.actions.length ) {
				console.log('deactivate =============================================');
				this.active = false;
				this.game.passMove();
				return;
			}

			var action = this.actions.pop(),
				reason = action.reason;

			// console.log( action );
			console.log( reason );

			// console.log( 'reason.type ', reason.type );
			switch ( reason.type ) {
				case self::GET_CHIP : {
					if (reason.by == -1) { this.gamer.bye( this.game.field.tyles[ reason.from ].chips[0] ); }
					else {
						if (reason.by != -2) {
							if (reason.by == 2) this.game.activeCube = this.gamer.cubeJoker[0];
							else this.game.activeCube = this.gamer.cubes[ reason.by ];
						}
						this.gamer.getChip( this.game.field.tyles[ reason.from ].chips[0] );
					}
				} break;
				
				case self::SET_CHIP : {
					var chip = this.gamer.plan.tyles['advWait' + reason.from].chips[0],
						loc = this.gamer.plan.tyles['advLoc' + reason.to];

					if (reason.by != -2) {
						if (reason.by == 2) this.game.activeCube = this.gamer.cubeJoker[0];
						else this.game.activeCube = this.gamer.cubes[ reason.by ];
					}
					this.gamer.applyChip(chip, loc)
				} break;
				
				case self::GET_GOODS : {
					var from = reason.from.pop();
					if ( reason.from.length ) this.actions.push( action );

					this.gamer.getGoods( this.game.field.tyles[ from ].chips[0] );
				} break;
				
				case self::SELL_GOODS : {
					var useCube;
					if (reason.by == -2) { useCube = false; }
					else {
						useCube = true;
						if (reason.by == 2) this.game.activeCube = this.gamer.cubeJoker[0];
						else this.game.activeCube = this.gamer.cubes[ reason.by ];
					}

					var tyle = this.gamer.plan.tyles['goods' + reason.from];
					this.gamer.sellGoods(tyle, useCube)
				} break;
				
				case self::GET_WORKER : {
					if (reason.by == 2) this.game.activeCube = this.gamer.cubeJoker[0];
					else this.game.activeCube = this.gamer.cubes[ reason.by ];
					this.gamer.changeCubeToWorker();
				} break;
				
				case self::USE_WORKER : {
					this.gamer.plan.tyles['worker'].delChips(1);
					this.gamer.cubes[ reason.cube ].incValue( reason.shift );
					this.game.status.setAI();
				} break;
			}
		}
	}
}
