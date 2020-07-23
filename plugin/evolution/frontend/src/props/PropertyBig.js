#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyBig extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	constructor(creature, id) {
		super(creature, #evConst.PROPERTY_BIG, id);
	}

	getNeedFood() {
		return 1;
	}
}
