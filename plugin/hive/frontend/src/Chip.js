#lx:private;

#lx:macros hive {lexedo.games.Hive}

class Chip #lx:namespace lexedo.games.Hive {
	constructor(gamer, type) {
		this.gamer = gamer;
		this.type = type;
	}

	getEnvironment() {
		return this.getGame().world.env;
	}

	getGame() {
		return this.gamer.game;
	}

	getGamer() {
		return this.gamer;
	}
}
