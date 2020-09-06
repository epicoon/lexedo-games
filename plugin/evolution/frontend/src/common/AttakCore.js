#lx:macros evConst {lexedo.games.Evolution.Constants};

class AttakCore #lx:namespace lexedo.games.Evolution {
	constructor(game) {
		this.game = game;
	}

	/**
	 * @param {lexedo.games.Evolution.Creature} carnival
	 * @param {lexedo.games.Evolution.Creature} prey
	 * @return bool
	 */
	checkAttakAvailability(carnival, prey) {
		if (carnival === prey) return false;

		if (prey.isBig() && !carnival.isBig()) return false;
		if (prey.isSwimming() !== carnival.isSwimming()) return false;
		if (prey.isHidden() && !carnival.isAcute()) return false;
		if (prey.isHole() && !prey.isUnderfed()) return false;
		if (prey.isSymbiont()) return false;

		return true;
	}

	/**
	 * @param {lexedo.games.Evolution.Creature} carnival
	 * @param {Object} data
	 */
	processAttakResult(carnival, data) {
		let preyGamer = this.game.getGamerById(data.preyGamer);

		if (data.result == #evConst.ATTAK_RESULT_SUCCESS) {
			this.game.applyFeedReport(data.feedReport);
			carnival.getGamer().canGetFood = false;

			preyGamer.dropCreature(data.preyReport);
		}

		//TODO
	}

}
