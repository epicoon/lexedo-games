#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyMimicry extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGamer().isLocal()) return;

		if (this.getEnvironment().attakCore.getPendingGamer() !== this.getGamer()) return;

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

		this.getGame().log(
			'Игрок '
			+ this.getGamer().getName()
			+ ' при помощи мимикрии перенаправил атаку на другое существо'
		);

		this.getEnvironment().attakCore.processAttakResult(
			this.getEnvironment().attakCore.getCarnival(),
			data
		);
	}

	/**
	 * @param {lexedo.games.Evolution.PropertyExist} target
	 */
	processTarget(target) {
		if (!this.checkTarget(target)) return;

		this.triggerPropertyAction({
			targetCreature: target.getCreature().getId()
		});
	}

	/**
	 * @return lexedo.games.Evolution.Property[]
	 */
	getTargets() {
		var result = [];

		let carnival = this.getEnvironment().attakCore.getCarnival();
		this.getGamer().getCreatures().each(creature=>{
			if (creature == this.getCreature()) return;

			if (this.getEnvironment().attakCore.checkAttakAvailability(carnival, creature))
				result.push(creature.getExistProperty());
		});

		return result;
	}
}
