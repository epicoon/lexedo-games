#lx:macros evConst {lexedo.games.Evolution.Constants};

class AttakCore #lx:namespace lexedo.games.Evolution {
	constructor(game) {
		this.game = game;
		this.hold = null;
	}

	getEnvironment() {
		return this.game.getEnvironment();
	}

	getPendingGamer() {
		if (this.hold === null) return null;
		return this.hold.prey.getGamer();
	}

	isOnHold() {
		return this.hold !== null;
	}

	getCarnival() {
		if (this.hold === null) return null;
		return this.hold.carnival;
	}

	/**
	 * @param {lexedo.games.Evolution.Creature} carnival
	 * @param {lexedo.games.Evolution.Creature} prey
	 * @return bool
	 */
	checkAttakAvailability(carnival, prey, showMsg = false) {
		var msg = false;

		if (carnival === prey)
			msg = #lx:i18n(tost.CreatureSelfAttak);
		else if (prey.isBig() && !carnival.isBig())
			msg = #lx:i18n(tost.CarnivalHasToBeBig);
		else if (prey.isSwimming() !== carnival.isSwimming())
			msg = #lx:i18n(tost.CarnivalAndPreySameEnv);
		else if (prey.isHidden() && !carnival.isAcute())
			msg = #lx:i18n(tost.CarnivalHasToHaveAcute);
		else if (prey.isHole() && !prey.isUnderfed())
			msg = #lx:i18n(tost.CreatureInHole);
		else if (prey.isSymbiont())
			msg = #lx:i18n(tost.CreatureSymbiont);

		if (msg) {
			if (showMsg) lx.Tost.warning(msg);
			return false;
		}

		return true;
	}

	/**
	 * @param {lexedo.games.Evolution.Creature} carnival
	 * @param {Object} data
	 */
	processAttakResult(carnival, data) {
		this.__unholdAttak();

		if (data.result == >>>evConst.ATTAK_RESULT_PENDING) {
			this.holdAttak(data);
			return;
		}

		if (data.result == >>>evConst.ATTAK_RESULT_SUCCESS) {
			this.game.applyFeedReport(data.feedReport);
			if (data.poisoned) carnival.poison();

			let preyGamer = this.game.getGamerById(data.preyGamer);
			preyGamer.dropCreature(data.preyReport);
		}
	}

	/**
	 * @param {lexedo.games.Evolution.Creature} carnival
	 * @param {Object} data
	 */
	processTailAttakResult(carnival, data) {
		this.__unholdAttak();

		this.game.applyFeedReport(data.feedReport);
		data.tailReport.forEach(item=>{
			let gamer = this.game.getGamerById(item[0]);
			gamer.getCreatureById(item[1]).dropProperty(item[2]);
			gamer.dropping += item[3];
		});
	}

	holdAttak(data) {
		let carnivalGamer = this.game.getGamerById(data.carnivalGamer);
		let carnival = carnivalGamer.getCreatureById(data.carnival);

		let preyGamer = this.game.getGamerById(data.preyGamer);
		let prey = preyGamer.getCreatureById(data.prey);

		this.hold = {carnival, prey};

		prey.getExistProperty().statusBox.add(lx.Box, {
			geom: true,
			key: 'prey',
			picture: this.getEnvironment().dataCatalog.getAttakedCreaturePicrute()
		});
		carnival.getExistProperty().statusBox.add(lx.Box, {
			geom: true,
			key: 'carnival',
			picture: this.getEnvironment().dataCatalog.getActiveCreaturePicrute()
		});

		if (carnivalGamer.isLocal()) {
			this.game.phase.hint = #lx:i18n(phaseHint.Waiting);
		} else if (preyGamer.isLocal()) {
			this.game.phase.hint = #lx:i18n(phaseHint.Attaked);
		}
	}

	__unholdAttak() {
		if (this.hold === null) return;

		this.hold.carnival.getExistProperty().statusBox.del('carnival');
		this.hold.prey.getExistProperty().statusBox.del('prey');
		this.hold = null;
		this.game.phase.actualize();
	}
}
