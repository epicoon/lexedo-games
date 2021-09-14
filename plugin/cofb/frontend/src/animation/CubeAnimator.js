class CubeAnimator extends lx.Timer #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		super(500);

		this.game = game;
		this.cube = null;
		this.way = 0;
		this.y0 = 0;

		this.whileCycle(function() {
			var k = this.shift(),
				shift;

			if ( k < 0.5 ) shift = this.way * k * 2;
			else shift = this.way * (1 - k) * 2;

			var x = lx.Math.randomInteger(0, 360) * Math.PI / 180,
				y = lx.Math.randomInteger(0, 360) * Math.PI / 180,
				z = lx.Math.randomInteger(0, 360) * Math.PI / 180;

			for (var i in this.cube) {
				var cube = this.cube[i];
				cube.mesh.rotation.x = x;
				cube.mesh.rotation.y = y;
				cube.mesh.rotation.z = z;
				cube.mesh.position.y = this.y0 + shift;
			}

			if (this.periodEnds()) {
				for (var i in this.cube) {
					var cube = this.cube[i];
					cube.mesh.rotation.x = 0;
					cube.mesh.rotation.y = 0;
					cube.mesh.rotation.z = 0;
					cube.genRandom();
				}

				this.cube = null;
				this.stop();

				this.game.applyCubeResult();
			}
		});
	}

	on(cube) {
		if (this.inAction) return;

		if (cube.push === undefined)
			this.cube = [ cube ];
		else this.cube = cube;
		this.way = 100;
		this.y0 = this.cube[0].mesh.position.y;
		this.start();
	}
}
