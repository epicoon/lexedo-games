#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyCarnival extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	constructor(creature, id) {
		super(creature, #evConst.PROPERTY_CARNIVAL, id);
	}

	getNeedFood() {
		return 1;
	}




}
