#lx:private;

#lx:macros hive {lexedo.games.Hive}

class Chip #lx:namespace >>>hive {
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
