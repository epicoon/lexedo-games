#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyTramp extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;

		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGame().phase.food) return;

		this.getEnvironment().triggerChannelEvent('property-action', {
			gamer: this.getGamer().getId(),
			creature: this.getCreature().getId(),
			property: this.getId()
		});
	}

	onActionProcess(data) {
		this.getGame().phase.food = data.foodCount;
		this.getGame().log(
			'Игрок '
			+ this.getGamer().getName()
			+ ' воспользовался свойством топотун и уничтожил единицу еды из кормовой базы'
		);
	}
}