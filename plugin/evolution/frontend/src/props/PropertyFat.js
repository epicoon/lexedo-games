#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyFat extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	constructor(creature, id) {
		super(creature, #evConst.PROPERTY_FAT, id);
	}

	hasFat() {
		return false;
	}
}
