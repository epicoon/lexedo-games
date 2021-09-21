#lx:macros Const {lexedo.games.Cofb.Constants};

class Pulsator #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		this.game = game;
		this.animator = new lx.Timer(500);

		this.animator.chips = [];
		this.animator.baseVectors = [];
		this.animator.k = 0.2;
		this.animator.extand = true;

		this.animator.on = function( mode ) {
			this.extand = mode;
			this.start();
		};

		this.animator.whileCycle(function() {
			var shift = this.shift(),
				k, blue;
			if ( this.extand ) {
				k = 1 + this.k * shift;
				blue = 1 - shift;
			} else {
				k = 1 + this.k - this.k * shift;
				blue = shift;
			}

			for (var i in this.chips) {
				for (var j in this.chips[i].mesh.geometry.vertices) {
					this.chips[i].mesh.geometry.vertices[j].copy( this.baseVectors[i][j] );
					this.chips[i].mesh.geometry.vertices[j].multiplyScalar(k);
				}
				this.chips[i].mesh.geometry.verticesNeedUpdate = true;

				if (this.chips[i].value === undefined) this.chips[i].setColor([1, 1, blue]);
			}

			if ( this.periodEnds() ) {
				this.on( !this.extand );
			}
		});

		this.animator.off = function() {
			for (var i in this.baseVectors) {
				for (var j in this.baseVectors[i]) {
					this.chips[i].mesh.geometry.vertices[j].copy( this.baseVectors[i][j] );
				}
				this.chips[i].mesh.geometry.verticesNeedUpdate = true;
				if (this.chips[i].value === undefined) this.chips[i].setColor([1, 1, 1]);
			}

			this.baseVectors = [];
			this.stop();
		};
	}

	start(chips) {
		this.animator.off();

		for (var i in chips) {
			var c = chips[i];
			this.animator.baseVectors.push([]);
			for (var j in c.mesh.geometry.vertices) {
				var v = new THREE.Vector3();
				v.copy( c.mesh.geometry.vertices[j] );
				this.animator.baseVectors[i].push(v);
			}
		}

		this.animator.chips = chips;
		this.animator.on(true);
	}

	cubePM(num) {
		var p = num + 1,
			m = num - 1;

		if ( p == 7 ) p = 1;
		if ( m == 0 ) m = 6;

		return [ m, num, p ];
	}

	on() {
		if (this.game.activeGamer != -1 && this.game.gamer().AI) {
			this.animator.off();
			return;
		}

		switch (true) {
			case this.game.status.isPhaseActivate():
				var loc = this.game.field.tyles['st' + (this.game.phase+1)];

				var chips = [];
				for ( var i in loc.chips ) chips.push( loc.chips[i] );

				this.start( chips );
			break;
			
			case this.game.status.isPlayOutCubes():
				var chips = [ this.game.cube ];
				for (var i in this.game.gamers) {
					chips.push( this.game.gamers[i].cubes[0] );
					chips.push( this.game.gamers[i].cubes[1] );
				}

				this.start( chips );
			break;

			case this.game.status.isPending():
				var chips = [],
					gamer = this.game.gamer();

				for (var i in gamer.plan.tyles['cube0'].chips) chips.push( gamer.plan.tyles['cube0'].chips[i] );
				for (var i in gamer.plan.tyles['cube1'].chips) chips.push( gamer.plan.tyles['cube1'].chips[i] );
				for (var i in gamer.plan.tyles['cubeJoker'].chips) chips.push( gamer.plan.tyles['cubeJoker'].chips[i] );
				if ( !gamer.silverUsed && gamer.plan.tyles['silver'].chips.length > 1 )
					for (var i in gamer.plan.tyles['silver'].chips) chips.push( gamer.plan.tyles['silver'].chips[i] );

				this.start( chips );
			break;

			case this.game.status.isUseCube():
				var gamer = this.game.gamer(),
					num = this.game.activeCube.value,
					nums, chips = [];

				if ( gamer.knows('k12') ) nums = this.cubePM( num );
				else nums = [ num ];

				for (var i in this.game.field.tyles) {
					if ( i.substr(0, 7) != 'advCube' ) continue;
					var loc = this.game.field.tyles[i];
					if ( nums.indexOf( loc.cube ) == -1 ) continue;

					for (var j in loc.chips)
						chips.push( loc.chips[j] );
				}

				for (var i in gamer.plan.tyles['worker'].chips) chips.push( gamer.plan.tyles['worker'].chips[i] );

				for (var i=0; i<3; i++) {
					if ( gamer.plan.tyles['goods' + i].chips.length && gamer.plan.tyles['goods' + i].chips[0].info.variant == num )
						for (var j in gamer.plan.tyles['goods' + i].chips) chips.push( gamer.plan.tyles['goods' + i].chips[j] );

					if ( gamer.plan.tyles['advWait' + i].chips.length )
						for (var j in gamer.plan.tyles['advWait' + i].chips) chips.push( gamer.plan.tyles['advWait' + i].chips[j] );
				}

				this.start( chips );
			break;

			case this.game.status.isUseSilver():
				var chips = [];

				for (var i in this.game.field.tyles) {
					if ( !this.game.field.tyles[i].chips.length ) continue;

					var str = i.substr(0, 7);
					if ( str == 'advSell' ) chips.push( this.game.field.tyles[i].chips[0] );
					if ( this.game.gamer().knows('k6') && str == 'advCube' ) chips.push( this.game.field.tyles[i].chips[0] );
				}

				this.start( chips );
			break;

			case this.game.status.isTrade():
				var chips = [],
					tyles = this.game.gamer().plan.tyles;

				for (var i=0; i<3; i++)
					if ( tyles['goods' + i].chips.length )
						for (var j in tyles['goods' + i].chips)
							chips.push( tyles['goods' + i].chips[j] );

				this.start( chips );
			break;

			case this.game.status.isGetBuilding():
				var chips = [];

				for (var i in this.game.field.tyles) {
					var loc = this.game.field.tyles[i];
					if ( !loc.chips.length ) continue;
					if ( i.substr(0, 7) != 'advCube' ) continue;
					if ( loc.groupe != >>>Const.GROUPE_BUILDING ) continue;

					chips.push( loc.chips[0] );
				}

				this.start( chips );
			break;

			case this.game.status.isGetMCK():
				var chips = [];

				for (var i in this.game.field.tyles) {
					var loc = this.game.field.tyles[i];
					if ( !loc.chips.length ) continue;
					if ( i.substr(0, 7) != 'advCube' ) continue;
					if ( loc.groupe != >>>Const.GROUPE_MINE && loc.groupe != >>>Const.GROUPE_CASTLE && loc.groupe != >>>Const.GROUPE_KNOWLEGE ) continue;

					chips.push( loc.chips[0] );
				}

				this.start( chips );
			break;

			case this.game.status.isGetAS():
				var chips = [];

				for (var i in this.game.field.tyles) {
					var loc = this.game.field.tyles[i];
					if ( !loc.chips.length ) continue;
					if ( i.substr(0, 7) != 'advCube' ) continue;
					if ( loc.groupe != >>>Const.GROUPE_ANIMAL && loc.groupe != >>>Const.GROUPE_SHIP ) continue;

					chips.push( loc.chips[0] );
				}

				this.start( chips );
			break;

			case this.game.status.isSetChip():
				var chips = [],
					tyles = this.game.gamer().plan.tyles;

				for (var i=0; i<3; i++)
					if ( tyles['advWait' + i].chips.length )
						for (var j in tyles['advWait' + i].chips)
							chips.push( tyles['advWait' + i].chips[j] );

				this.start( chips );
			break;

			case this.game.status.isGetGoods():
				var chips = [],
					gamer = this.game.gamer(),
					tyles = this.game.field.tyles;

				if ( gamer.knows('k5') && gamer.dowbleGoods == 1 ) {
					var nums = this.cubePM( gamer.goodsUsed );

					for (var i in tyles['goods' + nums[0]].chips)
						chips.push( tyles['goods' + nums[0]].chips[i] );
					for (var i in tyles['goods' + nums[2]].chips)
						chips.push( tyles['goods' + nums[2]].chips[i] );
				} else {
					for (var j=1; j<7; j++) {
						for (var i in tyles['goods' + j].chips)
							chips.push( tyles['goods' + j].chips[i] );
					}
				}

				this.start( chips );
			break;

			default : this.animator.off();
		}
	}
}