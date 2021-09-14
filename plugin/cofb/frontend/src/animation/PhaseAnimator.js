#lx:macros Const {lexedo.games.Cofb.Constants};

class PhaseAnimator extends lx.Timer #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		super(500);

		this.game = game;
		this.locus = null;
		this.pos0 = null;

		this.whileCycle(function() {
			var k = this.shift(),
				angle = -Math.PI * (1 - k);

			var y1 = this.game.field.surface() + this.locus.chips[0].sizes[1] * 0.5;

			for (var i=0; i<5; i++) {
				var chip = this.locus.chips[i],
					dest = this.game.field.locus['tn' + (i+1)],
					
					x1 = dest.parent.mesh.position.x + dest.x * >>>Const.FIELD_SIZE,
					z1 = dest.parent.mesh.position.z + dest.z * >>>Const.FIELD_SIZE,
					
					x0 = this.pos0[i].x,
					y0 = this.pos0[i].y,
					z0 = this.pos0[i].z,

					xShift = (x1 - x0) * k,
					yShift = (y1 - y0) * k,
					zShift = (z1 - z0) * k;

				chip.mesh.position.x = x0 + xShift;
				chip.mesh.position.y = y0 + yShift;
				chip.mesh.position.z = z0 + zShift;

				chip.mesh.rotation.z = angle;
			}

			if (this.periodEnds()) {

				var chips = [];
				for (var i in this.locus.chips) chips.push( this.locus.chips[i] );

				for (var i in chips) {
					var loc = this.game.field.locus['tn' + (+i+1)];
					loc.locate(chips[i]);
				}

				this.locus = null;
				this.stop();

				this.game.nextPhase();
			}
		});
	}

	on(locus) {
		if (this.inAction) return;

		this.locus = locus;
		this.pos0 = [];

		for (var i in locus.chips) {
			var chip = locus.chips[i];

			this.pos0.push({
				x : chip.mesh.position.x,
				y : chip.mesh.position.y,
				z : chip.mesh.position.z
			});
		}

		this.start();
	}
}
