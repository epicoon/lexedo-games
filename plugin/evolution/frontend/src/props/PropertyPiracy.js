class PropertyPiracy extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;


		//!!!
		this.triggerPropertyAction();


	}

	onActionProcess(data) {
		//!!!


		this.getGame().log(
			'Игрок '
			+ this.getGamer().getName()
			+ ' воспользовался свойством "пиратство"'
		);
	}
}
