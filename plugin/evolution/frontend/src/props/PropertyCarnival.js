#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyCarnival extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	getNeedFood() {
		return 1;
	}

	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGamer().isLocal()) return;

		if (!this.getGamer().canGetFood) return;
		if (!this.getCreature().isHungry()) return;

		var targets = this.getTargets();
		if (!targets.len) {
			lx.Tost('Нет целей');
			return;
		}

		this.getGame().mode.switchMode(#evConst.MOUSE_MODE_USE_PROPERTY, event, {
			property: this
		});
	}

	onActionProcess(data) {
		this.getGame().mode.reset();

		let preyGamer = this.getGame().getGamerById(data.preyGamer);

		this.getGame().log(
			'Игрок '
			+ this.getGamer().getName()
			+ ' атаковал существо игрока '
			+ preyGamer.getName()
		);

		this.getGamer().canGetFood = false;
		this.getEnvironment().attakCore.processAttakResult(this.getCreature(), data);
	}

	/**
	 * @param {lexedo.games.Evolution.PropertyExist} target
	 */
	processTarget(target) {
		if (!this.checkTarget(target)) return;

		this.triggerPropertyAction({
			targetGamer: target.getGamer().getId(),
			targetCreature: target.getCreature().getId()
		});
	}

	/**
	 * @return lexedo.games.Evolution.Property[]
	 */
	getTargets() {
		let carnival = this.getCreature();

		var result = [];
		this.getGame().eachGamer(gamer=>{
			gamer.getCreatures().each(creature=>{
				if (this.getEnvironment().attakCore.checkAttakAvailability(carnival, creature))
					result.push(creature.getExistProperty());
			});
		});
		return result;
	}
}
