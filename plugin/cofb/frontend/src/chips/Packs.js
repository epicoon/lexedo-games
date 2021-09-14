#lx:macros Const {lexedo.games.Cofb.Constants};

class Packs #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		this.game = game;
	}

	getFace(variant, black) {
		var result = >>>Const.CHIP_IMG_NAMES[variant];
		if (black) {
			result = 'black' + result;
		}
		return result;
	}

	clear() {
		for (var i in this)
			if (this[i].cart)
				this[i].clear();
	}

	init() {
		var ChipPackClass = lexedo.games.Cofb.ChipPack;

		this.blue = new ChipPackClass(this, 'blueSide', 'blue', true);
		this.blue.addChipInfo(>>>Const.GROUPE_SHIP, >>>Const.VARIANT_SHIP);

		this.darkgreen = new ChipPackClass(this, 'darkgreenSide', 'darkgreen', true);
		this.darkgreen.addChipInfo(>>>Const.GROUPE_CASTLE, >>>Const.VARIANT_CASTLE);

		this.gray = new ChipPackClass(this, 'graySide', 'gray', true);
		this.gray.addChipInfo(>>>Const.GROUPE_MINE, >>>Const.VARIANT_MINE);

		this.yellow = new ChipPackClass(this, 'yellowSide', 'yellow', false);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_1);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_2);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_3);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_4);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_5);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_6);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_8);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_9);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_10);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_11);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_13);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_16);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_17);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_18);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_19);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_20);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_21);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_22);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_23);
		this.yellow.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_26);

		this.green = new ChipPackClass(this, 'greenSide', 'green', false);
		for (var i=0; i<2; i++) {
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_COW2);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_COW3);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_CHICKEN2);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_CHICKEN3);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_SHEEP2);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_SHEEP3);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_PIG2);
			this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_PIG3);
		}
		this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_COW4);
		this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_CHICKEN4);
		this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_SHEEP4);
		this.green.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_PIG4);

		this.brown = new ChipPackClass(this, 'brownSide', 'brown', false);
		for (var i=0; i<5; i++) {
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_MARKET);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_CHURCH);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_HOTEL);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_SAWMILL);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_BANK);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_TOWNHALL);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_TRADEPOST);
			this.brown.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_WATCHTOWER);
		}

		this.black = new ChipPackClass(this, 'blackSide', 'black', false);
		for (var i=0; i<2; i++) {
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_MARKET);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_CHURCH);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_HOTEL);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_SAWMILL);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_BANK);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_TOWNHALL);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_TRADEPOST);
			this.black.addChipInfo(>>>Const.GROUPE_BUILDING, >>>Const.VARIANT_BUILDING_WATCHTOWER);
		}

		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_COW3);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_COW4);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_CHICKEN3);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_CHICKEN4);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_SHEEP3);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_SHEEP4);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_PIG3);
		this.black.addChipInfo(>>>Const.GROUPE_ANIMAL, >>>Const.VARIANT_ANIMAL_PIG4);

		for (var i=0; i<2; i++) this.black.addChipInfo(>>>Const.GROUPE_CASTLE, >>>Const.VARIANT_CASTLE);
		for (var i=0; i<2; i++) this.black.addChipInfo(>>>Const.GROUPE_MINE, >>>Const.VARIANT_MINE);
		for (var i=0; i<6; i++) this.black.addChipInfo(>>>Const.GROUPE_SHIP, >>>Const.VARIANT_SHIP);

		this.black.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_7);
		this.black.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_12);
		this.black.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_14);
		this.black.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_15);
		this.black.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_24);
		this.black.addChipInfo(>>>Const.GROUPE_KNOWLEGE, >>>Const.VARIANT_KNOWLEDGE_25);
	

		this.goods = new ChipPackClass(this, 'brownSide', 'goods', false);
		for (var i=0; i<7; i++) for (var j=0; j<6; j++)
			this.goods.addChipInfo(>>>Const.GROUPE_GOODS, j+1);

		this.advPack = [ this.blue, this.darkgreen, this.gray, this.yellow, this.green, this.brown ];


		this.bonusMax = new ChipPackClass(this, 'brownSide', 'brownSide', false);
		this.bonusMax.addChipInfo(>>>Const.GROUPE_BONUS_MAX, >>>Const.VARIANT_BONUS_MAX_DARKGREEN);
		this.bonusMax.addChipInfo(>>>Const.GROUPE_BONUS_MAX, >>>Const.VARIANT_BONUS_MAX_BROWN);
		this.bonusMax.addChipInfo(>>>Const.GROUPE_BONUS_MAX, >>>Const.VARIANT_BONUS_MAX_BLUE);
		this.bonusMax.addChipInfo(>>>Const.GROUPE_BONUS_MAX, >>>Const.VARIANT_BONUS_MAX_GREEN);
		this.bonusMax.addChipInfo(>>>Const.GROUPE_BONUS_MAX, >>>Const.VARIANT_BONUS_MAX_GRAY);
		this.bonusMax.addChipInfo(>>>Const.GROUPE_BONUS_MAX, >>>Const.VARIANT_BONUS_MAX_YELLOW);

		this.bonusMin = new ChipPackClass(this, 'brownSide', 'brownSide', false);
		this.bonusMin.addChipInfo(>>>Const.GROUPE_BONUS_MIN, >>>Const.VARIANT_BONUS_MIN_DARKGREEN);
		this.bonusMin.addChipInfo(>>>Const.GROUPE_BONUS_MIN, >>>Const.VARIANT_BONUS_MIN_BROWN);
		this.bonusMin.addChipInfo(>>>Const.GROUPE_BONUS_MIN, >>>Const.VARIANT_BONUS_MIN_BLUE);
		this.bonusMin.addChipInfo(>>>Const.GROUPE_BONUS_MIN, >>>Const.VARIANT_BONUS_MIN_GREEN);
		this.bonusMin.addChipInfo(>>>Const.GROUPE_BONUS_MIN, >>>Const.VARIANT_BONUS_MIN_GRAY);
		this.bonusMin.addChipInfo(>>>Const.GROUPE_BONUS_MIN, >>>Const.VARIANT_BONUS_MIN_YELLOW);

		this.silver = new ChipPackClass(this, 'brownSide', 'brownSide', true);
		this.silver.addChipInfo(>>>Const.GROUPE_SILVER, >>>Const.VARIANT_SILVER);

		this.worker = new ChipPackClass(this, 'brownSide', 'brownSide', true);
		this.worker.addChipInfo(>>>Const.GROUPE_WORKER, >>>Const.VARIANT_WORKER);

		this.green100 = new ChipPackClass(this, 'darkgreenSide', 'darkgreenSide', true);
		this.green100.addChipInfo(>>>Const.GROUPE_100, >>>Const.VARIANT_COUNTER_GREEN100);
		this.blue100 = new ChipPackClass(this, 'blueSide', 'blueSide', true);
		this.blue100.addChipInfo(>>>Const.GROUPE_100, >>>Const.VARIANT_COUNTER_BLUE100);
		this.red100 = new ChipPackClass(this, 'redSide', 'redSide', true);
		this.red100.addChipInfo(>>>Const.GROUPE_100, >>>Const.VARIANT_COUNTER_RED100);
		this.black100 = new ChipPackClass(this, 'blackSide', 'blackSide', true);
		this.black100.addChipInfo(>>>Const.GROUPE_100, >>>Const.VARIANT_COUNTER_BLACK100);

		this.point100 = [ this.green100, this.blue100, this.red100, this.black100 ];
	}

	shuffle() {
		this.blue.shuffle();
		this.darkgreen.shuffle();
		this.gray.shuffle();
		this.yellow.shuffle();
		this.green.shuffle();
		this.brown.shuffle();
		this.black.shuffle();
		this.goods.shuffle();
	}
}
