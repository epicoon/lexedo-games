#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyHibernate extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getCreature().isUnderfed()) return;

		this.triggerPropertyAction();
	}

	onActionProcess(data) {
		this.getGamer().feedCreatures(data.feedReport);
		this.getGame().log(
			'Игрок '
			+ this.getGamer().getName()
			+ ' воспользовался свойством "спячка"'
		);
	}
}
