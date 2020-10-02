#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyTramp extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGamer().isLocal()) return;
		if (!this.getGame().phase.food) return;

		this.triggerPropertyAction();
	}

	onActionProcess(data) {
		this.getGame().phase.food = data.foodCount;
	}
}
