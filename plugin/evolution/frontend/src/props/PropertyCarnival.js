#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyCarnival #lx:namespace lexedo.games.Evolution extends lexedo.games.Evolution.Property {
	constructor(creature, id) {
		super(creature, #evConst.PROPERTY_CARNIVAL, id);
	}

	needFood() {
		return 1;
	}




}
