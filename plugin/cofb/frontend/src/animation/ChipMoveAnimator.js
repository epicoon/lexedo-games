class ChipMoveAnimator extends lx.Timer #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		super(500);

		this.game = game;
		this.chip = null;
		this.dest = null;
		this.pos0 = null;
		this.func = null;

		this.whileCycle(function() {
			var k = this.shift();

			for (var i in this.chip) {
				var chip = this.chip[i];
				if (!chip || !chip.mesh) continue;
				var dest = this.dest[i],
					crd = dest.coords(),
					x1 = crd[0],
					y1 = crd[1],
					z1 = crd[2],
					x0 = this.pos0[i].x,
					y0 = this.pos0[i].y + chip.sizes[1] * 0.5,
					z0 = this.pos0[i].z,
					xShift = (x1 - x0) * k,
					yShift = (y1 - y0) * k,
					zShift = (z1 - z0) * k;

				chip.mesh.position.x = x0 + xShift;
				chip.mesh.position.y = y0 + yShift;
				chip.mesh.position.z = z0 + zShift;
			}

			// console.log('action ', this.func);

			if (this.periodEnds()) {
				for (var i in this.chip) if ( this.chip[i] && this.chip[i].mesh ) this.dest[i].locate( this.chip[i] );

				this.chip = null;
				this.dest = null;
				this.pos0 = null;

				// console.log('timer ', this.func);

				this.stop();
				var func = this.func;
				this.func = null;
				if (func !== null) func();
			}
		});
	}

	on(chip, dest, func) {
		if (this.inAction) return;

		// console.log(func);

		if (chip.push === undefined) {
			this.chip = [ chip ];
			this.dest = [ dest ];
		} else {
			this.chip = chip;
			this.dest = dest;
		}
		this.func = func;

		this.pos0 = [];
		for (var i in this.chip) {
			if (!this.chip[i] || !this.chip[i].mesh) this.pos0.push({});
			else this.pos0.push({
				x : this.chip[i].mesh.position.x,
				y : this.chip[i].mesh.position.y,
				z : this.chip[i].mesh.position.z
			});
		}

		this.start();
		// console.log(this.func);
	};
}
