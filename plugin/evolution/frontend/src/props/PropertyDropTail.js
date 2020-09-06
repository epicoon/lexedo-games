#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyDropTail extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGamer().isLocal()) return;

		if (this.getEnvironment().attakCore.getPendingGamer() !== this.getGamer()) return;

		this.getGame().mode.switchMode(#evConst.MOUSE_MODE_USE_PROPERTY, event, {
			property: this
		});
	}

	onActionProcess(data) {
		this.getGame().mode.reset();

		this.getGame().log(
			'Игрок '
			+ this.getGamer().getName()
			+ ' использовал отбрасывание хвоста'
		);

		this.getEnvironment().attakCore.processTailAttakResult(
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
			targetProperty: target.getId()
		});
	}

	/**
	 * @return lexedo.games.Evolution.Property[]
	 */
	getTargets() {
		var result = [];

		this.getCreature().getProperties().each(property=>{
			if (property.getType() == #evConst.PROPERTY_EXIST) return;
			result.push(property);
		});

		return result;
	}
}
