#lx:private;

#lx:macros evConst {lexedo.games.Evolution.Constants};
#lx:macros evFood {lexedo.games.Evolution.Food};

class Food #lx:namespace lexedo.games.Evolution {
	#lx:const
		MIDDLE = 1,
		TOP = 2,
		BOTTOM = 3;

	constructor(property, type) {
		this.property = property;
		this.type = type;
		this.position = null;
	}

	locate() {
		this.position = __definePosition(this);
		this.property.statusBox.add(lx.Box, {
			geom: true,
			key: this.getKey(),
			picture: this.getPicture()
		});
	}

	drop() {
		this.property.statusBox.del(this.getKey());
	}

	getPicture() {
		if (this.type == >>>evConst.FOOD_TYPE_FAT) return '_fat.png';

		var picture = (this.type == >>>evConst.FOOD_TYPE_RED) ? '_redFood' : '_blueFood';
		switch (this.position) {
			case self::MIDDLE: return picture += '.png';
			case self::TOP:    return picture += '21.png';
			case self::BOTTOM: return picture += '22.png';
		}
	}

	getKey() {
		switch (this.position) {
			case self::MIDDLE: return 'm';
			case self::TOP:    return 't';
			case self::BOTTOM: return 'b';
		}
	}
}


/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

function __definePosition(self) {
	if (self.type == >>>evConst.FOOD_TYPE_FAT) return >>>evFood.MIDDLE;

	var needFood = self.property.getNeedFood();
	if (needFood == 1) return >>>evFood.MIDDLE;

	if (self.property.getEatenFood() == 0) return >>>evFood.TOP;
	return >>>evFood.BOTTOM;
}
