#lx:macros hive {lexedo.games.Hive}

class Map #lx:namespace lexedo.games.Hive {
    constructor(game) {
    	this.game = game;

    	this.map = {};
	}

	getEnvironment() {
		return this.game.world.env;
	}

	getGame() {
		return this.game;
	}

	getWorld() {
		return this.game.world;
	}

	addTyleByPoint(point) {
		return this.addTyle(point.x, point.z);
	}

	getTyleByPoint(point) {
		return this.getTyle(point.x, point.z);
	}

	addTyle(x, z) {
		let tyle = this.getTyle(x, z);
		if (tyle) return tyle;

		let key = x + '_' + z;
		tyle = new >>>hive.Tyle(this, x, z);
		this.map[key] = tyle;

		return tyle;
	}

	getTyle(x, z) {
		let key = x + '_' + z;
		if (key in this.map) return this.map[key];
		return null;
	}

	addChipRelatedTyles(chip) {
		let coords = chip.getRelatedCoords();
		coords.forEach(point=>this.addTyleByPoint(point));
	}

	highlightEmptyTyles(bool = true) {
		for (let key in this.map) {
			let tyle = this.map[key];
			if (tyle.isEmpty()) {
				bool ? tyle.highlightOn() : tyle.highlightOff();
			}
		}

	}


	
}


