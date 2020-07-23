#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyParasite extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	constructor(creature, id) {
		super(creature, #evConst.PROPERTY_PARASITE, id);
	}

	getNeedFood() {
		return 2;
	}
}
