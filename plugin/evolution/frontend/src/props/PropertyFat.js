#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyFat extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGamer().isLocal()) return;

		if (this.hasFat()
			&& this.getCreature().isUnderfed()
			&& this.getGamer().isAvailableToUseFat(this.getCreature())
		) this.triggerPropertyAction();
	}

	onActionProcess(data) {
		this.loseFood();
		this.getGame().applyFeedReport(data.feedReport);

		this.getGamer().canGetFood = false;
		this.getGamer().creatureHasUsedFat = this.getCreature();
	}

	hasFat() {
		return this.foodCollection.len != 0;
	}

	setFeedMode(bool) {
		this.feedMode = bool;
	}

	getEatenFood() {
		return 0;
	}
}
