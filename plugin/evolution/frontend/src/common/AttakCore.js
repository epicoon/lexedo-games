#lx:macros evConst {lexedo.games.Evolution.Constants};

class AttakCore #lx:namespace lexedo.games.Evolution {
	constructor(game) {
		this.game = game;
		this.hold = null;
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
			msg = 'Существо не может атаковать себя';
		else if (prey.isBig() && !carnival.isBig())
			msg = 'Хищник должен быть большим, чтобы атаковать большое существо';
		else if (prey.isSwimming() !== carnival.isSwimming())
			msg = 'Хищник и жертва должны обитать в одной среде';
		else if (prey.isHidden() && !carnival.isAcute())
			msg = 'Хищник должен иметь острое зрение, чтобы увидеть цель';
		else if (prey.isHole() && !prey.isUnderfed())
			msg = 'Цель - норное существо и уже накормлено, не может быть атаковано';
		else if (prey.isSymbiont())
			msg = 'Цель защищена симбионтом';

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
		data.log.each(msg=>this.game.log(msg));

		let preyGamer = this.game.getGamerById(data.preyGamer);

		if (data.result == #evConst.ATTAK_RESULT_PENDING) {
			this.__holdAttak(data);
			this.game.log(
				'Атакованное существо игрока ' + preyGamer.getName()
				+ ' имеет защитные свойства. Нужно подождать, когда он их применит.'
			);
			return;
		}

		if (data.result == #evConst.ATTAK_RESULT_SUCCESS) {
			this.game.applyFeedReport(data.feedReport);
			if (data.poisoned) carnival.poison();

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
		data.tailReport.each(item=>{
			let gamer = this.game.getGamerById(item[0]);
			gamer.getCreatureById(item[1]).dropProperty(item[2]);
			gamer.dropping += item[3];
		});
	}

	__holdAttak(data) {
		let carnivalGamer = this.game.getGamerById(data.carnivalGamer);
		let carnival = carnivalGamer.getCreatureById(data.carnival);

		let preyGamer = this.game.getGamerById(data.preyGamer);
		let prey = preyGamer.getCreatureById(data.prey);

		this.hold = {carnival, prey};

		prey.getExistProperty().statusBox.add(lx.Box, {
			geom: true,
			key: 'prey',
			picture: '_attakedCreature.png'
		});
		carnival.getExistProperty().statusBox.add(lx.Box, {
			geom: true,
			key: 'carnival',
			picture: '_activeCreature.png'
		});

		if (carnivalGamer.isLocal()) {
			this.game.phase.hint = 'Ожидание действий игрока...';
		} else if (preyGamer.isLocal()) {
			this.game.phase.hint = 'Ваше существо атаковано. Выберите способ защиты.';
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
