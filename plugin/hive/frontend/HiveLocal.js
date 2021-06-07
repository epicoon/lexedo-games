#lx:module lexedo.games.HiveLocal;

#lx:macros hive {lexedo.games.Hive}

class Game #lx:namespace lexedo.games.Hive {
	constructor(plugin, env) {

		this.env = env;
		let config = {
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
			},
			canvas : plugin->>canvas
		};
		this.world = new #hive.World(config, env, this);


		//TODO
		__test(this);
	}
}

function __test(self) {
	var map = self.world.getMap();

	var chip = new #hive.ChipMesh(self.world);
	chip.locateInMap(0, 0);
	map.addChipRelatedTyles(chip);

	var chip = new #hive.ChipMesh(self.world);
	chip.locateInMap(1, 0);
	map.addChipRelatedTyles(chip);

	var chip = new #hive.ChipMesh(self.world);
	chip.locateInMap(-1, 0);
	map.addChipRelatedTyles(chip);

	map.highlightEmptyTyles();

}
