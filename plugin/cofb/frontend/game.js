/* bgChipInfo */
/* bgChipPack */
/* bgPacks */
/* bgField */
/* bgLocus */
/* bgChip */
/* bgPlan */
/* bgCube */
/* bgGamer */
/* bgGame */
/* bgAnimation */
/* bgPulsator */
/* bgAI */


var GROUPE_SHIP = 0,
	GROUPE_CASTLE = 1,
	GROUPE_MINE = 2,
	GROUPE_KNOWLEGE = 3,
	GROUPE_ANIMAL = 4,
	GROUPE_BUILDING = 5,
	GROUPE_GOODS = 6,
	GROUPE_BONUS_MAX = 7,
	GROUPE_BONUS_MIN = 8,
	GROUPE_COUNTER = 9,
	GROUPE_WORKER = 10,
	GROUPE_SILVER = 11,
	GROUPE_100 = 12;

var VARIANT_SHIP = 0;
var VARIANT_CASTLE = 1;
var VARIANT_MINE = 2;

var VARIANT_KNOWLEDGE_1 = 3,
	VARIANT_KNOWLEDGE_2 = 4,
	VARIANT_KNOWLEDGE_3 = 5,
	VARIANT_KNOWLEDGE_4 = 6,
	VARIANT_KNOWLEDGE_5 = 7,
	VARIANT_KNOWLEDGE_6 = 8,
	VARIANT_KNOWLEDGE_7 = 9,
	VARIANT_KNOWLEDGE_8 = 10,
	VARIANT_KNOWLEDGE_9 = 11,
	VARIANT_KNOWLEDGE_10 = 12,
	VARIANT_KNOWLEDGE_11 = 13,
	VARIANT_KNOWLEDGE_12 = 14,
	VARIANT_KNOWLEDGE_13 = 15,
	VARIANT_KNOWLEDGE_14 = 16,
	VARIANT_KNOWLEDGE_15 = 17,
	VARIANT_KNOWLEDGE_16 = 18,
	VARIANT_KNOWLEDGE_17 = 19,
	VARIANT_KNOWLEDGE_18 = 20,
	VARIANT_KNOWLEDGE_19 = 21,
	VARIANT_KNOWLEDGE_20 = 22,
	VARIANT_KNOWLEDGE_21 = 23,
	VARIANT_KNOWLEDGE_22 = 24,
	VARIANT_KNOWLEDGE_23 = 25,
	VARIANT_KNOWLEDGE_24 = 26,
	VARIANT_KNOWLEDGE_25 = 27;
	VARIANT_KNOWLEDGE_26 = 28;

var VARIANT_ANIMAL_COW2 = 29,
	VARIANT_ANIMAL_COW3 = 30,
	VARIANT_ANIMAL_COW4 = 31,
	VARIANT_ANIMAL_CHICKEN2 = 32,
	VARIANT_ANIMAL_CHICKEN3 = 33,
	VARIANT_ANIMAL_CHICKEN4 = 34,
	VARIANT_ANIMAL_SHEEP2 = 35,
	VARIANT_ANIMAL_SHEEP3 = 36,
	VARIANT_ANIMAL_SHEEP4 = 37,
	VARIANT_ANIMAL_PIG2 = 38,
	VARIANT_ANIMAL_PIG3 = 39,
	VARIANT_ANIMAL_PIG4 = 40;

var VARIANT_BUILDING_MARKET = 41,
	VARIANT_BUILDING_CHURCH = 42,
	VARIANT_BUILDING_HOTEL = 43,
	VARIANT_BUILDING_SAWMILL = 44,
	VARIANT_BUILDING_BANK = 45,
	VARIANT_BUILDING_TOWNHALL = 46,
	VARIANT_BUILDING_TRADEPOST = 47,
	VARIANT_BUILDING_WATCHTOWER = 48;

var VARIANT_BONUS_MAX_DARKGREEN = 49,
	VARIANT_BONUS_MAX_BROWN = 50,
	VARIANT_BONUS_MAX_BLUE = 51,
	VARIANT_BONUS_MAX_GREEN = 52,
	VARIANT_BONUS_MAX_GRAY = 53,
	VARIANT_BONUS_MAX_YELLOW = 54;

var VARIANT_BONUS_MIN_DARKGREEN = 55,
	VARIANT_BONUS_MIN_BROWN = 56,
	VARIANT_BONUS_MIN_BLUE = 57,
	VARIANT_BONUS_MIN_GREEN = 58,
	VARIANT_BONUS_MIN_GRAY = 59,
	VARIANT_BONUS_MIN_YELLOW = 60;

var VARIANT_WORKER = 61;
var VARIANT_SILVER = 62;

var VARIANT_COUNTER_GREEN100 = 63,
	VARIANT_COUNTER_BLUE100 = 64,
	VARIANT_COUNTER_RED100 = 65,
	VARIANT_COUNTER_BLACK100 = 66;

var CHIP_IMG_NAMES = [
	'ship', 'castle', 'mine', 'knowledge1', 'knowledge2', 'knowledge3', 'knowledge4', 'knowledge5', 'knowledge6',
	'knowledge7', 'knowledge8', 'knowledge9','knowledge10', 'knowledge11', 'knowledge12', 'knowledge13', 'knowledge14', 'knowledge15',
	'knowledge16', 'knowledge17', 'knowledge18', 'knowledge19', 'knowledge20', 'knowledge21', 'knowledge22', 'knowledge23', 'knowledge24',
	'knowledge25', 'knowledge26', 'cow2', 'cow3', 'cow4', 'chicken2', 'chicken3', 'chicken4', 'sheep2', 'sheep3', 'sheep4', 'pig2', 'pig3',
	'pig4', 'market', 'church', 'hotel', 'sawmill', 'bank', 'townhall', 'tradepost', 'watchtower',

	'blue567', 'darkgreen567', 'gray567', 'yellow567', 'green567', 'brown567',
	'blue234', 'darkgreen234', 'gray234', 'yellow234', 'green234', 'brown234',

	'worker',
	'silver',

	'green100',
	'blue100',
	'red100',
	'black100'
];


//=============================================================================================================================
/* bgChipInfo */
function bgChipInfo(groupe, variant, pack) {
	this.groupe = groupe;
	this.variant = variant;
	this.pack = pack;
	this.chip = undefined;

	this.face = function() {
		if (this.groupe == GROUPE_GOODS) return 'goods' + this.variant;

		var black = false;
		if ( bgPacks['black'] === this.pack ) black = true;
		return bgPacks.getFace(this.variant, black);
	}

	this.genChip = function() {
		var chip = new bgChip(this);
		chip.create({face : this.face(), side : this.pack.side, back : this.pack.back});
		this.chip = chip;
		return chip;
	}
}
/* bgChipInfo */
//=============================================================================================================================




//=============================================================================================================================
/* bgChipPack */
function bgChipPack(side, back, unlimit) {
	this.side = side;
	this.back = back;

	this.unlimit = unlimit;
	this.cart = [];
	this.sequence = [];
	this.inGame = 0;

	this.addChipInfo = function(groupe, variant) {
		var chipInfo = new bgChipInfo(groupe, variant, this);
		this.cart.push( chipInfo );
		return chipInfo;
	}

	this.shuffle = function() {
		if (this.unlimit) return;

		this.sequence = [];
		for (var i=0; i<this.cart.length; i++) this.sequence.push(i);
		for (var i = this.sequence.length - 1; i > 0; i--) {
			var num = Math.floor(Math.random() * (i + 1));
			var d = this.sequence[num];
			this.sequence[num] = this.sequence[i];
			this.sequence[i] = d;
		}
		return this;
	}

	this.getOne = function() {
		if (this.unlimit) return this.cart[0];

		var num = this.inGame;
		this.inGame++;
		if ( this.sequence.length ) return this.cart[ this.sequence[num] ];

		return this.cart[num];
	}

	this.clear = function() {
		for (var i in this.cart) {
			var cart = this.cart[i];
			if ( cart.chip != undefined ) {
				cart.chip.del();
				cart.chip = undefined;
			}
		}	

		this.cart = [];
		this.sequence = [];
		this.inGame = 0;
	}
}
/* bgChipPack */
//=============================================================================================================================




//=============================================================================================================================
/* bgPacks */
var bgPacks = {
	getFace : function(variant, black) {
		var result = CHIP_IMG_NAMES[variant];
		if (black) {
			// result[0].toUpperCase();
			result = 'black' + result;
		}
		return result;
	},

	clear : function() {
		for (var i in this) {
			if ( this[i].cart == undefined ) continue;
			this[i].clear();
		}
	},

	init : function() {
		this.blue = new bgChipPack('blueSide', 'blue', true);
		this.blue.addChipInfo(GROUPE_SHIP, VARIANT_SHIP);

		this.darkgreen = new bgChipPack('darkgreenSide', 'darkgreen', true);
		this.darkgreen.addChipInfo(GROUPE_CASTLE, VARIANT_CASTLE);

		this.gray = new bgChipPack('graySide', 'gray', true);
		this.gray.addChipInfo(GROUPE_MINE, VARIANT_MINE);

		this.yellow = new bgChipPack('yellowSide', 'yellow', false);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_1);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_2);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_3);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_4);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_5);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_6);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_8);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_9);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_10);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_11);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_13);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_16);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_17);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_18);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_19);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_20);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_21);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_22);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_23);
		this.yellow.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_26);

		this.green = new bgChipPack('greenSide', 'green', false);
		for (var i=0; i<2; i++) {
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_COW2);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_COW3);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_CHICKEN2);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_CHICKEN3);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_SHEEP2);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_SHEEP3);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_PIG2);
			this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_PIG3);
		}
		this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_COW4);
		this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_CHICKEN4);
		this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_SHEEP4);
		this.green.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_PIG4);

		this.brown = new bgChipPack('brownSide', 'brown', false);
		for (var i=0; i<5; i++) {
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_MARKET);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_CHURCH);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_HOTEL);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_SAWMILL);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_BANK);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_TOWNHALL);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_TRADEPOST);
			this.brown.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_WATCHTOWER);
		}

		this.black = new bgChipPack('blackSide', 'black', false);
		for (var i=0; i<2; i++) {
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_MARKET);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_CHURCH);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_HOTEL);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_SAWMILL);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_BANK);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_TOWNHALL);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_TRADEPOST);
			this.black.addChipInfo(GROUPE_BUILDING, VARIANT_BUILDING_WATCHTOWER);
		}

		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_COW3);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_COW4);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_CHICKEN3);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_CHICKEN4);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_SHEEP3);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_SHEEP4);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_PIG3);
		this.black.addChipInfo(GROUPE_ANIMAL, VARIANT_ANIMAL_PIG4);

		for (var i=0; i<2; i++) this.black.addChipInfo(GROUPE_CASTLE, VARIANT_CASTLE);
		for (var i=0; i<2; i++) this.black.addChipInfo(GROUPE_MINE, VARIANT_MINE);
		for (var i=0; i<6; i++) this.black.addChipInfo(GROUPE_SHIP, VARIANT_SHIP);

		this.black.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_7);
		this.black.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_12);
		this.black.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_14);
		this.black.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_15);
		this.black.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_24);
		this.black.addChipInfo(GROUPE_KNOWLEGE, VARIANT_KNOWLEDGE_25);
	

		this.goods = new bgChipPack('brownSide', 'goods', false);
		for (var i=0; i<7; i++) for (var j=0; j<6; j++)
			this.goods.addChipInfo(GROUPE_GOODS, j+1);

		this.advPack = [ this.blue, this.darkgreen, this.gray, this.yellow, this.green, this.brown ];


		this.bonusMax = new bgChipPack('brownSide', 'brownSide', false);
		this.bonusMax.addChipInfo(GROUPE_BONUS_MAX, VARIANT_BONUS_MAX_DARKGREEN);
		this.bonusMax.addChipInfo(GROUPE_BONUS_MAX, VARIANT_BONUS_MAX_BROWN);
		this.bonusMax.addChipInfo(GROUPE_BONUS_MAX, VARIANT_BONUS_MAX_BLUE);
		this.bonusMax.addChipInfo(GROUPE_BONUS_MAX, VARIANT_BONUS_MAX_GREEN);
		this.bonusMax.addChipInfo(GROUPE_BONUS_MAX, VARIANT_BONUS_MAX_GRAY);
		this.bonusMax.addChipInfo(GROUPE_BONUS_MAX, VARIANT_BONUS_MAX_YELLOW);

		this.bonusMin = new bgChipPack('brownSide', 'brownSide', false);
		this.bonusMin.addChipInfo(GROUPE_BONUS_MIN, VARIANT_BONUS_MIN_DARKGREEN);
		this.bonusMin.addChipInfo(GROUPE_BONUS_MIN, VARIANT_BONUS_MIN_BROWN);
		this.bonusMin.addChipInfo(GROUPE_BONUS_MIN, VARIANT_BONUS_MIN_BLUE);
		this.bonusMin.addChipInfo(GROUPE_BONUS_MIN, VARIANT_BONUS_MIN_GREEN);
		this.bonusMin.addChipInfo(GROUPE_BONUS_MIN, VARIANT_BONUS_MIN_GRAY);
		this.bonusMin.addChipInfo(GROUPE_BONUS_MIN, VARIANT_BONUS_MIN_YELLOW);

		this.silver = new bgChipPack('brownSide', 'brownSide', true);
		this.silver.addChipInfo(GROUPE_SILVER, VARIANT_SILVER);

		this.worker = new bgChipPack('brownSide', 'brownSide', true);
		this.worker.addChipInfo(GROUPE_WORKER, VARIANT_WORKER);

		this.green100 = new bgChipPack('darkgreenSide', 'darkgreenSide', true);
		this.green100.addChipInfo(GROUPE_100, VARIANT_COUNTER_GREEN100);
		this.blue100 = new bgChipPack('blueSide', 'blueSide', true);
		this.blue100.addChipInfo(GROUPE_100, VARIANT_COUNTER_BLUE100);
		this.red100 = new bgChipPack('redSide', 'redSide', true);
		this.red100.addChipInfo(GROUPE_100, VARIANT_COUNTER_RED100);
		this.black100 = new bgChipPack('blackSide', 'blackSide', true);
		this.black100.addChipInfo(GROUPE_100, VARIANT_COUNTER_BLACK100);

		this.point100 = [ this.green100, this.blue100, this.red100, this.black100 ];
	},

	shuffle : function() {
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
/* bgPacks */
//=============================================================================================================================




//=============================================================================================================================
/* bgField */
function bgField() {
	this.mesh = undefined;
	this.name = 'field';

	this.locus = [];

	this.addLocus = function(name, x, y, info) {
		var locus = new bgLocus(name, x, y, this);
		this.locus[name] = locus;
		locus.lxMerge(info);
		// for (var i in info) locus[i] = info[i];
	}

	this.create = function() {
		var t1 = cofb.world.getTexture( 'field' ),
			t2 = cofb.world.getTexture( 'brownSide' );

		var material = [
			new THREE.MeshLambertMaterial({ map: t1 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 })
		];

		var w = cofb.FIELD_SIZE, h = 5, d = w * 0.723;

		this.mesh = cofb.world.newMesh({
			geometry: new lx3dGeometry.cutBox(w, h, d, [0, 0, 0, 0], cofb.fisSMOOTH),
			material,
			clickable: true
		});
		this.mesh.name = 'field';

		this.sizes = [w, h, d];

		cofb.world.registerStaff(this);

		// для размещения товаров по стадиям игры
		this.addLocus('st1', -0.4025, -0.265, { type : LOCUS_GOODS_STAGE });
		this.addLocus('st2', -0.3325, -0.265, { type : LOCUS_GOODS_STAGE });
		this.addLocus('st3', -0.265, -0.265, { type : LOCUS_GOODS_STAGE });
		this.addLocus('st4', -0.1975, -0.265, { type : LOCUS_GOODS_STAGE });
		this.addLocus('st5', -0.1275, -0.265, { type : LOCUS_GOODS_STAGE });

		// для размещения товаров по раундам стадии
		this.addLocus('tn1', -0.4025, -0.165, { type : LOCUS_GOODS_TURN });
		this.addLocus('tn2', -0.4025, -0.1, { type : LOCUS_GOODS_TURN });
		this.addLocus('tn3', -0.4025, -0.03, { type : LOCUS_GOODS_TURN });
		this.addLocus('tn4', -0.4025, 0.0375, { type : LOCUS_GOODS_TURN });
		this.addLocus('tn5', -0.4025, 0.105, { type : LOCUS_GOODS_TURN });

		// для размещения товаров в ожидание
		this.addLocus('goods1', 0.0625, -0.1675, { type : LOCUS_GOODS_INGAME, cube : 1 });
		this.addLocus('goods2', 0.2375, -0.0875, { type : LOCUS_GOODS_INGAME, cube : 2 });
		this.addLocus('goods3', 0.2375, 0.0875, { type : LOCUS_GOODS_INGAME, cube : 3 });
		this.addLocus('goods4', 0.0625, 0.1675, { type : LOCUS_GOODS_INGAME, cube : 4 });
		this.addLocus('goods5', -0.1125, 0.0875, { type : LOCUS_GOODS_INGAME, cube : 5 });
		this.addLocus('goods6', -0.1125, -0.0875, { type : LOCUS_GOODS_INGAME, cube : 6 });

		// улучшения на кубиках
		this.addLocus('advCube12' + GROUPE_BUILDING, 0.03, -0.27, { type : LOCUS_ADVANTAGE_CUBE, cube : 1, amt : 2, groupe : GROUPE_BUILDING });
		this.addLocus('advCube12' + GROUPE_SHIP, 0.0975, -0.27, { type : LOCUS_ADVANTAGE_CUBE, cube : 1, amt : 2, groupe : GROUPE_SHIP });
		this.addLocus('advCube13' + GROUPE_KNOWLEGE, -0.0375, -0.27, { type : LOCUS_ADVANTAGE_CUBE, cube : 1, amt : 3, groupe : GROUPE_KNOWLEGE });
		this.addLocus('advCube14' + GROUPE_ANIMAL, 0.1625, -0.27, { type : LOCUS_ADVANTAGE_CUBE, cube : 1, amt : 4, groupe : GROUPE_ANIMAL });

		this.addLocus('advCube22' + GROUPE_KNOWLEGE, 0.3375, -0.1275, { type : LOCUS_ADVANTAGE_CUBE, cube : 2, amt : 2, groupe : GROUPE_KNOWLEGE });
		this.addLocus('advCube22' + GROUPE_CASTLE, 0.3375, -0.0525, { type : LOCUS_ADVANTAGE_CUBE, cube : 2, amt : 2, groupe : GROUPE_CASTLE });
		this.addLocus('advCube23' + GROUPE_BUILDING, 0.4025, -0.1275, { type : LOCUS_ADVANTAGE_CUBE, cube : 2, amt : 3, groupe : GROUPE_BUILDING });
		this.addLocus('advCube24' + GROUPE_BUILDING, 0.4025, -0.0525, { type : LOCUS_ADVANTAGE_CUBE, cube : 2, amt : 4, groupe : GROUPE_BUILDING });

		this.addLocus('advCube32' + GROUPE_ANIMAL, 0.3375, 0.05, { type : LOCUS_ADVANTAGE_CUBE, cube : 3, amt : 2, groupe : GROUPE_ANIMAL });
		this.addLocus('advCube32' + GROUPE_BUILDING, 0.3375, 0.125, { type : LOCUS_ADVANTAGE_CUBE, cube : 3, amt : 2, groupe : GROUPE_BUILDING });
		this.addLocus('advCube33' + GROUPE_SHIP, 0.4025, 0.05, { type : LOCUS_ADVANTAGE_CUBE, cube : 3, amt : 3, groupe : GROUPE_SHIP });
		this.addLocus('advCube34' + GROUPE_KNOWLEGE, 0.4025, 0.125, { type : LOCUS_ADVANTAGE_CUBE, cube : 3, amt : 4, groupe : GROUPE_KNOWLEGE });

		this.addLocus('advCube42' + GROUPE_SHIP, 0.03, 0.2675, { type : LOCUS_ADVANTAGE_CUBE, cube : 4, amt : 2, groupe : GROUPE_SHIP });
		this.addLocus('advCube42' + GROUPE_BUILDING, 0.0975, 0.2675, { type : LOCUS_ADVANTAGE_CUBE, cube : 4, amt : 2, groupe : GROUPE_BUILDING });
		this.addLocus('advCube43' + GROUPE_ANIMAL, 0.1625, 0.2675, { type : LOCUS_ADVANTAGE_CUBE, cube : 4, amt : 3, groupe : GROUPE_ANIMAL });
		this.addLocus('advCube44' + GROUPE_MINE, -0.0375, 0.2675, { type : LOCUS_ADVANTAGE_CUBE, cube : 4, amt : 4, groupe : GROUPE_MINE });

		this.addLocus('advCube52' + GROUPE_MINE, -0.21, 0.05, { type : LOCUS_ADVANTAGE_CUBE, cube : 5, amt : 2, groupe : GROUPE_MINE });
		this.addLocus('advCube52' + GROUPE_KNOWLEGE, -0.21, 0.125, { type : LOCUS_ADVANTAGE_CUBE, cube : 5, amt : 2, groupe : GROUPE_KNOWLEGE });
		this.addLocus('advCube53' + GROUPE_BUILDING, -0.275, 0.05, { type : LOCUS_ADVANTAGE_CUBE, cube : 5, amt : 3, groupe : GROUPE_BUILDING });
		this.addLocus('advCube54' + GROUPE_BUILDING, -0.275, 0.125, { type : LOCUS_ADVANTAGE_CUBE, cube : 5, amt : 4, groupe : GROUPE_BUILDING });

		this.addLocus('advCube62' + GROUPE_BUILDING, -0.21, -0.1275, { type : LOCUS_ADVANTAGE_CUBE, cube : 6, amt : 2, groupe : GROUPE_BUILDING });
		this.addLocus('advCube62' + GROUPE_ANIMAL, -0.21, -0.0525, { type : LOCUS_ADVANTAGE_CUBE, cube : 6, amt : 2, groupe : GROUPE_ANIMAL });
		this.addLocus('advCube63' + GROUPE_CASTLE, -0.275, -0.1275, { type : LOCUS_ADVANTAGE_CUBE, cube : 6, amt : 3, groupe : GROUPE_CASTLE, groupe2 : GROUPE_MINE });
		this.addLocus('advCube64' + GROUPE_SHIP, -0.275, -0.0525, { type : LOCUS_ADVANTAGE_CUBE, cube : 6, amt : 4, groupe : GROUPE_SHIP });

		// улучшения продающиеся
		this.addLocus('advSell12', 0.0625, -0.0575, { type : LOCUS_ADVANTAGE_FORSALE, amt : 2 });
		this.addLocus('advSell22', 0.03, 0, { type : LOCUS_ADVANTAGE_FORSALE, amt : 2 });
		this.addLocus('advSell32', 0.095, 0, { type : LOCUS_ADVANTAGE_FORSALE, amt : 2 });
		this.addLocus('advSell42', 0.0625, 0.055, { type : LOCUS_ADVANTAGE_FORSALE, amt : 2 });
		this.addLocus('advSell53', -0.0025, -0.0575, { type : LOCUS_ADVANTAGE_FORSALE, amt : 3 });
		this.addLocus('advSell63', 0.1275, 0.055, { type : LOCUS_ADVANTAGE_FORSALE, amt : 3 });
		this.addLocus('advSell74', -0.0025, 0.055, { type : LOCUS_ADVANTAGE_FORSALE, amt : 4 });
		this.addLocus('advSell84', 0.1275, -0.0575, { type : LOCUS_ADVANTAGE_FORSALE, amt : 4 });

		// бонусы большие
		this.addLocus('bmax1', 0.255, -0.28, { type : LOCUS_BONUS_INGAME, max : true });
		this.addLocus('bmax5', 0.33, -0.28, { type : LOCUS_BONUS_INGAME, max : true });
		this.addLocus('bmax0', 0.4075, -0.28, { type : LOCUS_BONUS_INGAME, max : true });
		this.addLocus('bmax4', 0.255, 0.275, { type : LOCUS_BONUS_INGAME, max : true });
		this.addLocus('bmax2', 0.33, 0.275, { type : LOCUS_BONUS_INGAME, max : true });
		this.addLocus('bmax3', 0.4075, 0.275, { type : LOCUS_BONUS_INGAME, max : true });

		// бонусы маленькие
		this.addLocus('bmin1', 0.255, -0.22, { type : LOCUS_BONUS_INGAME, max : false });
		this.addLocus('bmin5', 0.3325, -0.22, { type : LOCUS_BONUS_INGAME, max : false });
		this.addLocus('bmin0', 0.4075, -0.22, { type : LOCUS_BONUS_INGAME, max : false });
		this.addLocus('bmin4', 0.255, 0.2125, { type : LOCUS_BONUS_INGAME, max : false });
		this.addLocus('bmin2', 0.3325, 0.2125, { type : LOCUS_BONUS_INGAME, max : false });
		this.addLocus('bmin3', 0.4075, 0.2125, { type : LOCUS_BONUS_INGAME, max : false });

		// порядок ходов
		this.addLocus('seq0', -0.41, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 0 });
		this.addLocus('seq1', -0.36375, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 1 });
		this.addLocus('seq2', -0.3175, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 2 });
		this.addLocus('seq3', -0.27125, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 3 });
		this.addLocus('seq4', -0.225, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 4 });
		this.addLocus('seq5', -0.17875, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 5 });
		this.addLocus('seq6', -0.1325, 0.2075, { type : LOCUS_GAMER_SEQUENCE, pos : 6 });

		// шкала очков
		this.addLocus('point0', -0.4675, 0.3, { type : LOCUS_GAMER_POINTS, pos : 0 });
		var step = -0.03375,
			current = 0.235,
			point = 1;
		for (var i=0; i<18; i++) {
			this.addLocus('point' + point, -0.4675, current, { type : LOCUS_GAMER_POINTS, pos : point });
			current += step;
			point++;
		}
		step = 0.034725, current = -0.432775;
		for (var i=0; i<27; i++) {
			this.addLocus('point' + point, current, -0.33875, { type : LOCUS_GAMER_POINTS, pos : point });
			current += step;
			point++;
		}
		step = 0.03375, current = -0.305;
		for (var i=0; i<20; i++) {
			this.addLocus('point' + point, 0.47, current, { type : LOCUS_GAMER_POINTS, pos : point });
			current += step;
			point++;
		}
		step = -0.034725, current = 0.435275;
		for (var i=0; i<19; i++) {
			this.addLocus('point' + point, current, 0.33875, { type : LOCUS_GAMER_POINTS, pos : point });
			current += step;
			point++;
		}
		this.addLocus('point85', -0.189775, 0.3025, { type : LOCUS_GAMER_POINTS, pos : 85 });
		this.addLocus('point86', -0.189775, 0.26875, { type : LOCUS_GAMER_POINTS, pos : 86 });
		this.addLocus('point87', -0.2245, 0.26875, { type : LOCUS_GAMER_POINTS, pos : 87 });
		this.addLocus('point88', -0.259225, 0.26875, { type : LOCUS_GAMER_POINTS, pos : 88 });
		this.addLocus('point89', -0.259225, 0.3025, { type : LOCUS_GAMER_POINTS, pos : 89 });
		this.addLocus('point90', -0.259225, 0.33625, { type : LOCUS_GAMER_POINTS, pos : 90 });
		this.addLocus('point91', -0.29395, 0.33625, { type : LOCUS_GAMER_POINTS, pos : 91 });
		this.addLocus('point92', -0.328675, 0.33625, { type : LOCUS_GAMER_POINTS, pos : 92 });
		this.addLocus('point93', -0.328675, 0.3025, { type : LOCUS_GAMER_POINTS, pos : 93 });
		this.addLocus('point94', -0.328675, 0.26875, { type : LOCUS_GAMER_POINTS, pos : 94 });
		this.addLocus('point95', -0.3634, 0.26875, { type : LOCUS_GAMER_POINTS, pos : 95 });
		this.addLocus('point96', -0.398125, 0.26875, { type : LOCUS_GAMER_POINTS, pos : 96 });
		this.addLocus('point97', -0.398125, 0.3025, { type : LOCUS_GAMER_POINTS, pos : 97 });
		this.addLocus('point98', -0.398125, 0.33625, { type : LOCUS_GAMER_POINTS, pos : 98 });
		this.addLocus('point99', -0.43285, 0.33625, { type : LOCUS_GAMER_POINTS, pos : 99 });

		// кубик
		this.addLocus('cube', -0.125, 0.275, { type : LOCUS_CUBE_GAME });
	}

	this.surface = function() { return this.mesh.position.y + this.sizes[1] * 0.5; }


	this.create();
}
/* bgField */
//=============================================================================================================================




//=============================================================================================================================
/* bgLocus */
var LOCUS_GOODS_STAGE = 0,
	LOCUS_GOODS_TURN = 1,
	LOCUS_GOODS_INGAME = 2,
	LOCUS_GOODS_INGAMER = 3,
	LOCUS_GOODS_SALES = 4,
	LOCUS_ADVANTAGE_CUBE = 5,
	LOCUS_ADVANTAGE_FORSALE = 6,
	LOCUS_ADVANTAGE_WAITING = 7,
	LOCUS_ADVANTAGE_LOCATED = 8,
	LOCUS_SILVER = 9,
	LOCUS_WORKER = 10,
	LOCUS_CUBE_GAME = 11,
	LOCUS_CUBE_GAMER = 12,
	LOCUS_CUBE_WAITING = 13,
	LOCUS_BONUS_INGAME = 14,
	LOCUS_BONUS_INGAMER = 15,
	LOCUS_GAMER_SEQUENCE = 16,
	LOCUS_GAMER_POINTS = 17,
	LOCUS_COUNTER = 18;

function bgLocus(name, x, z, parent) {
	this.name = name;
	this.x = x;
	this.z = z;
	this.parent = parent;

	this.chips = [];

	this.filledHeight = function() {
		var h = 0;
		for (var i in this.chips) h += this.chips[i].sizes[1];
		return h;
	}

	this.remove = function(chip) {
		var index = this.chips.indexOf(chip);
		if (index == -1) return;
		this.chips.splice(index, 1);
		var h = this.parent.surface();
		for (var i in this.chips) {
			var ch = this.chips[i];
			ch.mesh.position.y = h + ch.sizes[1] * 0.5;
			h += ch.sizes[1];
		}
	}

	this.locate = function(chip) {
		if (chip.locus != undefined) chip.locus.remove(chip);

		chip.locus = this;

		var x = this.x * cofb.FIELD_SIZE,
			z = this.z * cofb.FIELD_SIZE;

		chip.putOn( this.parent );
		chip.mesh.position.x += x;
		chip.mesh.position.z += z;
		chip.mesh.position.y += this.filledHeight();

		this.chips.push(chip);
	}

	this.coords = function() {
		var x = this.parent.mesh.position.x + this.x * cofb.FIELD_SIZE,
			y = this.parent.surface() + this.filledHeight(),
			z = this.parent.mesh.position.z + this.z * cofb.FIELD_SIZE;
		return [x, y, z];
	}

	this.delChips = function(amt) {
		if (amt == undefined) amt = this.chips.length;
		if ( amt > this.chips.length ) amt = this.chips.length;

		for (var i=0; i<amt; i++) {
			var chip = this.chips.pop();
			chip.del();
		}
	}
}
/* bgLocus */
//=============================================================================================================================




//=============================================================================================================================
/* bgChip */
function bgChip(info) { this.__bgChip(info); }

bgChip.prototype.__bgChip = function(info) {
	this.mesh = undefined;
	this.info = info;
	this.locus = undefined;
	cofb.world.registerStaff(this);
}

bgChip.prototype.genGeometry = function() {
	var w, h, d, angles;

	if ( this.info.id != undefined ) {

		var w = cofb.FIELD_SIZE * 0.0375,
			h = cofb.FIELD_SIZE * 0.03125,
			w2 = w * 0.5,
			d = w,
			angles = [w2, w2, w2, w2];

	} else if ( this.info.groupe <= GROUPE_BUILDING || this.info.groupe == GROUPE_100 ) {
		var w = cofb.FIELD_SIZE * 0.0625,
			h = cofb.FIELD_SIZE * 0.00625,
			d = w,
			w2 = w * 0.5,
			w4 = w * 0.25,
			angles = [[w2, w4], [w2, w4], [w2, w4], [w2, w4]];
	} else if (this.info.groupe == GROUPE_GOODS || this.info.groupe == GROUPE_BONUS_MAX) {
		var w = cofb.FIELD_SIZE * 0.0625,
			h = cofb.FIELD_SIZE * 0.00625,
			d = w,
			angles = [0, 0, 0, 0];
	} else if (this.info.groupe == GROUPE_BONUS_MIN || this.info.groupe == GROUPE_WORKER) {
		var w = cofb.FIELD_SIZE * 0.046875,
			h = cofb.FIELD_SIZE * 0.00625,
			d = w,
			angles = [0, 0, 0, 0];
	} else if (this.info.groupe == GROUPE_SILVER) {
		var w = cofb.FIELD_SIZE * 0.046875,
			h = cofb.FIELD_SIZE * 0.00625,
			d = w,
			w4 = w * 0.3,
			angles = [[w4, w4], [w4, w4], [w4, w4], [w4, w4]];
	} 

	var geom = new lx3dGeometry.cutBox(w, h, d, angles, cofb.fisSMOOTH);

	return { geometry : geom, sizes : [w, h, d] };
}

bgChip.prototype.create = function(textures) {
	var t1 = cofb.world.getTexture( textures.face ),
		t2 = (textures.back != undefined) ? cofb.world.getTexture( textures.back ) : t1,
		t3 = cofb.world.getTexture( textures.side );

	var material = [
		new THREE.MeshLambertMaterial({ map: t1 }),
		new THREE.MeshLambertMaterial({ map: t2 }),
		new THREE.MeshLambertMaterial({ map: t3 }),
		new THREE.MeshLambertMaterial({ map: t3 }),
		new THREE.MeshLambertMaterial({ map: t3 }),
		new THREE.MeshLambertMaterial({ map: t3 })
	];

	var geom = this.genGeometry();

	this.mesh = cofb.world.newMesh({
		geometry: geom.geometry,
		material,
		clickable: true
	});
	this.mesh.name = this.name;

	this.sizes = geom.sizes;
}

bgChip.prototype.putOn = function(field) {
	this.mesh.position.x = field.mesh.position.x;
	this.mesh.position.z = field.mesh.position.z;
	this.mesh.position.y = field.surface() + this.sizes[1] * 0.5;
}

bgChip.prototype.turn = function() {
	if ( this.mesh.rotation.z != 0 ) this.mesh.rotation.z = 0;
	else this.mesh.rotation.z = Math.PI;
}

bgChip.prototype.setColor = function(color) {
	for (var i=0; i<6; i++) {
		var mat = this.mesh.material[i];
		// var mat = this.mesh.material.materials[i];
		mat.color.r = color[0];
		mat.color.g = color[1];
		mat.color.b = color[2];
	}
}

bgChip.prototype.del = function() {
	cofb.world.removeMesh( this.mesh );

	this.info.chip = undefined;

	if (this.locus != undefined) {
		var index = this.locus.chips.indexOf(this);
		if (index != -1) this.locus.chips.splice(index, 1);
	}

	cofb.world.unregisterStaff(this);
}
/* bgChip */
//=============================================================================================================================




//=============================================================================================================================
/* bgPlan */
var PLAN_CUBE_MAP = [6, 5, 4, 3, 2, 1, 6, 5, 4, 5, 4, 3, 1, 2, 3, 6, 1, 2, 6, 5, 4, 1, 2, 5, 4, 3, 1, 2, 6, 1, 2, 5, 6, 3, 4, 1, 3];
var PLAN_GROUPE_MAP = [
	[GROUPE_ANIMAL, GROUPE_CASTLE, GROUPE_CASTLE, GROUPE_KNOWLEGE, GROUPE_ANIMAL, GROUPE_ANIMAL, GROUPE_CASTLE, GROUPE_KNOWLEGE, GROUPE_BUILDING,
	GROUPE_ANIMAL, GROUPE_ANIMAL, GROUPE_BUILDING, GROUPE_KNOWLEGE, GROUPE_BUILDING, GROUPE_BUILDING,
	GROUPE_SHIP, GROUPE_SHIP, GROUPE_SHIP, GROUPE_CASTLE, GROUPE_SHIP, GROUPE_SHIP, GROUPE_SHIP,
	GROUPE_BUILDING, GROUPE_BUILDING, GROUPE_MINE, GROUPE_BUILDING, GROUPE_BUILDING, GROUPE_ANIMAL,
	GROUPE_BUILDING, GROUPE_MINE, GROUPE_KNOWLEGE, GROUPE_BUILDING, GROUPE_BUILDING, GROUPE_MINE, GROUPE_KNOWLEGE, GROUPE_KNOWLEGE, GROUPE_BUILDING]
];

function bgPlan(gamer, type) {
	this.mesh = undefined;
	this.gamer = gamer;
	this.type = type;
	this.name = 'field.' + gamer.id + '.' + type; 

	this.locus = [];

	this.addLocus = function(name, x, y, info) {
		var locus = new bgLocus(name, x, y, this);
		this.locus[name] = locus;
		for (var i in info) locus[i] = info[i];
	}

	this.create = function() {
		var fileName = 'plan';
		if (this.type + 1 < 10) fileName += '0';
		fileName += (this.type + 1);

		var t1 = cofb.world.getTexture( fileName ),
			t2 = cofb.world.getTexture( cofb.GAMER_COLOR[ this.gamer.id ] );

		var material = [
			new THREE.MeshLambertMaterial({ map: t1 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t2 })
		];

		var w = cofb.FIELD_SIZE * 0.7, h = 5, d = w * 0.723;

		this.mesh = cofb.world.newMesh({
			geometry: new lx3dGeometry.cutBox(w, h, d, [0, 0, 0, 0], cofb.fisSMOOTH),
			material,
			clickable: true
		});
		this.mesh.name = this.name;

		this.sizes = [w, h, d];

		// var x = 0, z = 0;
		// switch (this.gamer.id) {
		// 	case 0 : { x = bgGame.field.mesh.position.x - (bgGame.field.sizes[0] + this.sizes[0]) * 0.5 - cofb.FIELD_SIZE*0.02 } break;
		// 	case 1 : { x = bgGame.field.mesh.position.x + (bgGame.field.sizes[0] + this.sizes[0]) * 0.5 + cofb.FIELD_SIZE*0.02 } break;
		// 	case 2 : { z = bgGame.field.mesh.position.z - (bgGame.field.sizes[2] + this.sizes[2]) * 0.5 - cofb.FIELD_SIZE*0.02 } break;
		// 	case 3 : { z = bgGame.field.mesh.position.z + (bgGame.field.sizes[2] + this.sizes[2]) * 0.5 + cofb.FIELD_SIZE*0.02 } break;
		// }
		// this.mesh.position.x = x;
		// this.mesh.position.z = z;

		cofb.world.registerStaff(this);

		// ожидающие улучшения
		this.addLocus('advWait0', -0.215, 0.195, { type : LOCUS_ADVANTAGE_WAITING });
		this.addLocus('advWait1', -0.145, 0.195, { type : LOCUS_ADVANTAGE_WAITING });
		this.addLocus('advWait2', -0.075, 0.195, { type : LOCUS_ADVANTAGE_WAITING });

		// размещенные улучшения
		var amt = 4,
			baseX = 0.00125,
			baseZ = -0.1625,
			tabX = -0.03125,
			tabZ = 0.056,
			stepX = 0.063125,
			inc = 1,
			counter = 0;
		for (var i=0; i<7; i++) {
			for (var j=0; j<amt; j++) {
				this.addLocus('advLoc' + counter, baseX + stepX * j, baseZ, { type : LOCUS_ADVANTAGE_LOCATED, cube : 0, groupe : 0 });
				counter++;
			}
			if (amt == 7) inc = -1;
			amt += inc;
			baseX += tabX * inc;
			baseZ += tabZ;
		}
		for (var i=0; i<37; i++) {
			var locus = this.locus['advLoc' + i];
			locus.cube = PLAN_CUBE_MAP[i];
			locus.groupe = PLAN_GROUPE_MAP[this.type][i];
		}

		// товары для продажи
		this.addLocus('goods0', -0.2275, -0.2025, { type : LOCUS_GOODS_INGAMER, cube : 0 });
		this.addLocus('goods1', -0.2275, -0.135, { type : LOCUS_GOODS_INGAMER, cube : 0 });
		this.addLocus('goods2', -0.16, -0.135, { type : LOCUS_GOODS_INGAMER, cube : 0 });

		// товары проданные
		this.addLocus('goods', -0.16, -0.2025, { type : LOCUS_GOODS_SALES });

		// серебро
		this.addLocus('silver', -0.3, -0.1675, { type : LOCUS_SILVER });

		// рабочие
		this.addLocus('worker', -0.2975, 0.195, { type : LOCUS_WORKER });

		// кубики
		this.addLocus('cube0', 0.0775, -0.225, { type : LOCUS_CUBE_GAMER });
		this.addLocus('cube1', 0.1175, -0.225, { type : LOCUS_CUBE_GAMER });
		this.addLocus('cubeJoker', 0.0375, -0.225, { type : LOCUS_CUBE_GAMER });
		this.addLocus('cubeRest', 0.2925, -0.1875, { type : LOCUS_CUBE_GAMER });

		// бонус
		this.addLocus('bonus', 0.3125, -0.1125, { type : LOCUS_BONUS_INGAMER });
		
		// счетчики +100
		this.addLocus('point100', -0.035, -0.22, { type : LOCUS_COUNTER });
	}

	this.setPosition = function(x, y, z) {
		if (y == undefined) { y = x[1]; z = x[2]; x = x[0]; }

		var newPos = new THREE.Vector3(x, y, z),
			shift = new THREE.Vector3();

		shift.subVectors(newPos, this.mesh.position);

		this.mesh.position.copy(newPos);

		for (var i in this.locus) {
			var l = this.locus[i];
			for (var j in l.chips) {
				var ch = l.chips[j];
				ch.mesh.position.add(shift);
			}
		}
	}

	this.surface = function() { return this.mesh.position.y + this.sizes[1] * 0.5; }

	this.advLocNeiborNums = function(num) {
		num = +num;
		var amt = [4, 5, 6, 7, 6, 5, 4],
			lims = [ [0, 3], [4, 8], [9, 14], [15, 21], [22, 27], [28, 32], [33, 36] ],
			row, test,
			arr = [];

		for (var i in lims)
			if ( num >= lims[i][0] && num <= lims[i][1] ) { row = +i; break; }

		test = num - 1;
		if ( test >= lims[row][0] && test <= lims[row][1] ) arr.push( test );

		test = num + 1;
		if ( test >= lims[row][0] && test <= lims[row][1] ) arr.push( test );

		if (row > 0) {
			test = num - amt[row];
			if ( test >= lims[row - 1][0] && test <= lims[row - 1][1] ) arr.push( test );
			test = num - amt[row - 1];
			if ( test >= lims[row - 1][0] && test <= lims[row - 1][1] ) arr.push( test );
		}

		if (row < 6) {
			test = num + amt[row];
			if ( test >= lims[row + 1][0] && test <= lims[row + 1][1] ) arr.push( test );
			test = num + amt[row + 1];
			if ( test >= lims[row + 1][0] && test <= lims[row + 1][1] ) arr.push( test );
		}

		return arr;
	}

	this.advLocNeibor = function(loc) {
		var num, locus;
		if (loc.isNumber) {
			num = +loc;
			locus = this.locus['advLoc' + num];
		} else if ( loc.substr != undefined && loc.substr(0, 6) == 'advLoc' ) {
			num = +loc.split('c')[1];
			locus = this.locus[loc];
		} else if ( loc.filledHeight != undefined && loc.name.substr(0, 6) == 'advLoc' ) {
			locus = loc;
			num = +loc.name.split('c')[1];
		} else return [];

		var nums = this.advLocNeiborNums(num),
			arr = [];

		for (var i in nums) {
			arr.push( this.locus['advLoc' + nums[i]] );
		}

		return arr;
	}

	this.areaNums = function(num) {
		num = +num;
		var arr = [],
			ctx = this;

		function rec(num) {
			var index = arr.indexOf(num);
			if (index != -1) return;

			arr.push(num);

			var neib = ctx.advLocNeiborNums(num);
			for (var i in neib) {
				if ( ctx.locus['advLoc' + neib[i]].groupe == ctx.locus['advLoc' + num].groupe )
					rec( neib[i] );
			}
		}

		rec(num);

		return arr;		
	}

	this.area = function(loc) {
		var num, locus;
		if (loc.isNumber) {
			num = +loc;
			locus = this.locus['advLoc' + num];
		} else if ( loc.substr != undefined && loc.substr(0, 6) == 'advLoc' ) {
			num = +loc.split('c')[1];
			locus = this.locus[loc];
		} else if ( loc.filledHeight != undefined && loc.name.substr(0, 6) == 'advLoc' ) {
			locus = loc;
			num = +loc.name.split('c')[1];
		} else return [];

		var arr = [];

		var nums = this.areaNums(num);
		for (var i in nums) arr.push( this.locus['advLoc' + nums[i]] );

		return arr;
	}

	this.create();
}
/* bgPlan */
//=============================================================================================================================




//=============================================================================================================================
/* bgCube */
var CUBE_COLOR = [ [0, 1, 0], [0.5, 0.5, 1], [1, 0.3, 0.3], [0.6, 0.6, 0.6, 0.6] ];

function bgCube(id, num) {
	this.mesh = undefined;
	this.id = id;
	this.name = 'cube.' + num + '.' + id;
	this.locus = undefined;
	this.value = 1;
	cofb.world.registerStaff(this);

	this.create = function() {
		var material = [
			new THREE.MeshLambertMaterial({ map: cofb.world.getTexture('cube1') }),
			new THREE.MeshLambertMaterial({ map: cofb.world.getTexture('cube2') }),
			new THREE.MeshLambertMaterial({ map: cofb.world.getTexture('cube3') }),
			new THREE.MeshLambertMaterial({ map: cofb.world.getTexture('cube4') }),
			new THREE.MeshLambertMaterial({ map: cofb.world.getTexture('cube5') }),
			new THREE.MeshLambertMaterial({ map: cofb.world.getTexture('cube6') })
		];

		var w = cofb.FIELD_SIZE * 0.03,
			h = w,
			d = w,
			angles = [0, 0, 0, 0];

		this.mesh = cofb.world.newMesh({
			geometry: new lx3dGeometry.cutBox(w, h, d, angles, cofb.fisSMOOTH),
			material,
			clickable: true
		});
		this.mesh.name = this.name;

		this.sizes = [w, h, d];
		if (this.id != -1) this.setColor( CUBE_COLOR[ this.id ] );
	}

	this.setColor = function(color) {
		for (var i=0; i<6; i++) {
			var mat = this.mesh.material[i];
			mat.color.r = color[0];
			mat.color.g = color[1];
			mat.color.b = color[2];
		}
	}

	this.applyValue = function(val) {
		this.value = val;

		if (val == 7) {
			for (var i=0; i<6; i++)
				this.mesh.material[i].map = cofb.world.getTexture('cubeJoker');
			return;
		}

		for (var i=0; i<6; i++) {
			var mat = this.mesh.material[i];
			mat.map = cofb.world.getTexture('cube' + val);
			val++;
			if (val > 6) val = 1;
		}
	}

	this.incValue = function(val) {
		var newVal = this.value + val;
		if (newVal > 6) newVal -= 6;
		if (newVal < 1) newVal += 6;

		this.applyValue(newVal);
	}

	this.genRandom = function() {
		var val = lx.Math.randomInteger(1, 6);
		this.applyValue(val);
	}

	this.putOn = function(field) {
		this.mesh.position.x = field.mesh.position.x;
		this.mesh.position.z = field.mesh.position.z;
		this.mesh.position.y = field.surface() + this.sizes[1] * 0.5;
	}

	this.del = function() {
		cofb.world.removeMesh( this.mesh );

		if (this.locus !== undefined) {
			this.locus.chips.remove(this);
			// var index = this.locus.chips.indexOf(this);
			// if (index != -1) this.locus.chips.splice(index, 1);
		}

		cofb.world.unregisterStaff(this);
	}

	this.create();
}
/* bgCube */
//=============================================================================================================================




//=============================================================================================================================
/* bgGamer *//*********************************************
	genChip()
	activate()
	getJokerCube()
	reset()
	addKnowledge(val)
	knows(k)
	freeAdvSlot()
	bye(chip)
	changeCubeToWorker()
	sellGoods(locus, useCube, x, y)
	getChip(chip)
	findPlace(chip, nums)
	tryFindPlace(chip)
	applyChip(chip, loc, x, y)
	chipApplyPassiveResult(chip, x, y)
	chipApplyActiveResult(chip)
	getGoods(chip)

**********************************************************/

var SCORE_ANIMAL = 0,
	SCORE_GOODS = 1,
	SCORE_TOWER = 2,
	SCORE_FILL = 3,
	SCORE_FILLBONUS = 4,
	SCORE_WORKER = 5,
	SCORE_SILVER = 6,
	SCORE_LOSTGOODS = 7,
	SCORE_BONUS = 8,
	SCORE_KNOWELEGE = 9;

function bgGamer(id, sequence) {
	this.id = id;
	this.cubes = [undefined, undefined];
	this.knowledges = [];

	this.points = 0;
	this.pointsInfo = [];
	this.round = 0;
	this.cubesPlayed = false;
	this.silverUsed = false;

	this.cubeJoker = [];
	this.dowbleGoods = 0;
	this.goodsUsed = 0;

	this.AI = false;

	this.clear = function() {
		for (var i in this.plan.locus)
			this.plan.locus[i].delChips();

		this.cubes = [undefined, undefined];
		this.knowledges = [];

		this.points = 0;
		this.pointsInfo = [];
		this.round = 0;
		this.cubesPlayed = false;
		this.silverUsed = false;

		this.cubeJoker = [];
		this.dowbleGoods = 0;
		this.goodsUsed = 0;

		this.AI = false;

		cofb.world.removeMesh( this.plan.mesh );

		this.plan = undefined;
	}

	this.genChip = function() {
		var chip = new bgChip(this),
			color = cofb.GAMER_COLOR[this.id];
		chip.create({ face : color, side : color });
		return chip;		
	}

	this.counterChip = this.genChip();
	this.sequenceChip = this.genChip();

	this.plan = new bgPlan(this, 0);

	this.cubes[0] = new bgCube(id, 0);
	this.cubes[1] = new bgCube(id, 1);

	this.plan.locus['cube0'].locate( this.cubes[0] );
	this.plan.locus['cube1'].locate( this.cubes[1] );

	var info = bgPacks.darkgreen.getOne(),
		chip = info.genChip();
	this.plan.locus['advLoc18'].locate(chip);

	var goods = [];
	for (var i=0; i<3; i++) goods.push( bgPacks.goods.getOne() );

	for (var i in goods) {
		var g = goods[i],
			chip = g.genChip();

		for (var j=0; j<3; j++) {
			var loc = this.plan.locus['goods' + j];

			if (!loc.chips.length || loc.chips[0].info.variant == g.variant) {
				loc.locate(chip);
				break;
			}
		}
	}

	var silver = bgPacks.silver.getOne(),
		chip = silver.genChip();
	this.plan.locus['silver'].locate(chip);

	var workers = [];
	for (var i=0; i<sequence; i++) workers.push( bgPacks.worker.getOne() );
	for (var i in workers) {
		var chip = workers[i].genChip();
		this.plan.locus['worker'].locate(chip);
	}


	this.actions = [];

	this.getName = function() {
		return cofb.GAMER_NAMES[ this.id ];
	}

	this.activate = function() {
		this.round++;

		if (!this.AI) cofb.world.cameraAnimator.on( this.plan.mesh.position, cofb.Status.PENDING );
		else {
			var v0 = bgGame.field.mesh.position,
				v1 = this.plan.mesh.position,
				v = new THREE.Vector3();
			v.subVectors( v1, v0 );
			v.multiplyScalar( 0.5 );
			v.addVectors( v0, v );
			cofb.world.cameraAnimator.on( v, cofb.Status.PENDING, 1500 );
		}

		cofb.EventSupervisor.trigger('cofb_gamer_activated', this);
	}

	this.getJokerCube = function() {
		var cube = new bgCube(id, 2);
		this.cubeJoker.push(cube);
		cube.applyValue(7);
		return cube;
	}

	this.reset = function() {
		this.plan.locus['cube0'].locate( this.cubes[0] );
		this.plan.locus['cube1'].locate( this.cubes[1] );
		this.plan.locus['cubeJoker'].delChips();
		this.plan.locus['cubeRest'].delChips();
		this.cubeJoker = [];
		this.cubesPlayed = false;

		this.silverUsed = false;

		this.dowbleGoods = 0;
		this.goodsUsed = 0;
	}

	this.addKnowledge = function(val) {
		this.knowledges['k' + (val - 2)] = true;
	}

	this.knows = function(k) {
		return (k in this.knowledges);
	}

	this.freeAdvSlot = function() {
		var locs = this.plan.locus,
			loc = null;
		if ( !locs['advWait0'].chips.length ) loc = locs['advWait0'];
		else if ( !locs['advWait1'].chips.length ) loc = locs['advWait1'];
		else if ( !locs['advWait2'].chips.length ) loc = locs['advWait2'];
		return loc;
	}

	this.bye = function(chip) {
		loc = this.freeAdvSlot();

		this.plan.locus['silver'].delChips(2);
		this.silverUsed = true;
		bgGame.animator.chipMoveAnimator.on(chip, loc, function() {

			// console.log( 'bye end' );

			cofb.status.setPending();
		});
	}

	this.changeCubeToWorker = function() {
		var loc0 = bgGame.activeCube.locus;

		var chips = [ bgGame.activeCube ],
			dests = [ this.plan.locus['cubeRest'] ];

		var worker = bgPacks.worker.getOne(),
			chip = worker.genChip();
		loc0.locate(chip);
		chips.push( chip );
		dests.push( this.plan.locus['worker'] );

		worker = bgPacks.worker.getOne();
		chip = worker.genChip();
		loc0.locate(chip);
		chips.push( chip );
		dests.push( this.plan.locus['worker'] );

		if ( this.knows('k14') ) {
			worker = bgPacks.worker.getOne();
			chip = worker.genChip();
			loc0.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['worker'] );

			worker = bgPacks.worker.getOne();
			chip = worker.genChip();
			loc0.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['worker'] );
		}

		if ( this.knows('k13') ) {
			worker = bgPacks.silver.getOne();
			chip = worker.genChip();
			loc0.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['silver'] );
		}

		bgGame.animator.chipMoveAnimator.on(chips, dests, function() {
			bgGame.activeCube = undefined;
			cofb.status.setPending();
		});
	}

	this.sellGoods = function(locus, useCube, x, y) {
		var points = bgGame.gamerKeys.length * locus.chips.length,
			pos = this.counterChip.locus.pos;
		this.points += points;
		this.pointsInfo.push({ cod : SCORE_GOODS, info : locus.chips.length, amt : points });

		var chips = [], dests = [];

		if (useCube) {
			chips = [ bgGame.activeCube ],
			dests = [ this.plan.locus['cubeRest'] ];
		}

		for (var i in locus.chips) {
			var chip = locus.chips[i];
			chip.turn();
			chips.push( chip );
			dests.push( this.plan.locus['goods'] );
		}

		var silver = bgPacks.silver.getOne(),
			chip = silver.genChip();
		locus.locate(chip);
		chips.push( chip );
		dests.push( this.plan.locus['silver'] );

		if ( this.knows('k3') ) {
			silver = bgPacks.silver.getOne();
			chip = silver.genChip();
			locus.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['silver'] );
		}

		if ( this.knows('k4') ) {
			var worker = bgPacks.worker.getOne();
			chip = worker.genChip();
			locus.locate(chip);
			chips.push( chip );
			dests.push( this.plan.locus['worker'] );
		}

		var newPos = pos + points;
		if (newPos >= 100) {
			newPos -= 100;
			var chip100 = bgPacks.point100[this.id].getOne().genChip();
			this.counterChip.locus.locate( chip100 );
			chips.push( chip100 );
			dests.push( this.plan.locus['point100'] );
		}
		chips.push( this.counterChip );
		dests.push( bgGame.field.locus['point' + newPos] );

		bgGame.animator.chipMoveAnimator.on(chips, dests, function() {
			bgGame.activeCube = undefined;

			// console.log( 'sell end' );

			cofb.status.setPending();

			Plugin->floatPoints.start(['Проданы товары: +' + points], x, y);
		});
	}

	this.getChip = function(chip) {
		loc = this.freeAdvSlot();
		bgGame.animator.chipMoveAnimator.on([chip, bgGame.activeCube], [loc, this.plan.locus['cubeRest']], function() {
			bgGame.activeCube = undefined;

			// console.log( 'getChip end' );

			cofb.status.setPending();
		});
	}

	this.findPlace = function(chip, nums) {
		var locs = [];

		for (var i=0; i<37; i++) {
			var loc = this.plan.locus['advLoc' + i];

			if (loc.chips.length) continue;
			if (loc.groupe != chip.info.groupe) continue;
			var index = nums.indexOf( loc.cube );
			if (index == -1) continue;

			var neib = this.plan.advLocNeibor(loc);
			var fill = false;
			for (var j in neib) if (neib[j].chips.length) { fill = true; break; }
			if (!fill) continue;

			if (chip.info.groupe == GROUPE_BUILDING && !this.knows('k1')) {
				var area = this.plan.area(loc);

				var match = false;
				for (var j in area)
					if (area[j].chips.length && area[j].chips[0].info.variant == chip.info.variant)
						{ match = true; break; }

				if (match) continue;
			}

			locs.push(loc);
		}

		return locs;
	}

	this.tryFindPlace = function(chip) {
		cofb.world.clearSpiritStaff();

		var cube = bgGame.activeCube.value,
			arr = [cube];
		if (cube == 7) arr = [1, 2, 3, 4, 5, 6];
		else {
			if ( ( this.knows('k9') && (chip.info.groupe == GROUPE_BUILDING) )
			|| ( this.knows('k10') && (chip.info.groupe == GROUPE_SHIP || chip.info.groupe == GROUPE_ANIMAL) )
			|| ( this.knows('k11') && (chip.info.groupe == GROUPE_CASTLE || chip.info.groupe == GROUPE_MINE || chip.info.groupe == GROUPE_KNOWLEGE) ) ) {
				var p = cube + 1,
					m = cube - 1;
				if (p > 6) p -= 6;
				if (m < 1) m += 6;
				arr = [ cube, p, m ];
			}
		}

		var locs = this.findPlace(chip, arr);

		cofb.world.createSpiritStaff(chip, locs);
	}

	this.applyChip = function(chip, loc, x, y) {
		bgGame.animator.chipMoveAnimator.on([chip, bgGame.activeCube], [loc, this.plan.locus['cubeRest']], function() {
			bgGame.activeCube = undefined;

			// console.log( 'applyChip end' );

			bgGame.gamer().chipApplyPassiveResult(chip, x, y);
		});
	}

	this.chipApplyPassiveResult = function(chip, x, y) {
		// собираем пассивные эффекты
		var chips = [], dests = [],
			msgs = [],
			points = 0,
			loc = chip.locus,
			area = this.plan.area(loc),
			fullGroupe = [];

		for (var i=0; i<37; i++) {
			var l = this.plan.locus['advLoc' + i];
			if (l.groupe == loc.groupe) fullGroupe.push(l);
		}

		// от корабля - перемещение фишки очередности хода
		if ( chip.info.groupe == GROUPE_SHIP ) {
			var curr = this.sequenceChip.locus,
				pos = +curr.name[3];

			chips.push( this.sequenceChip );
			dests.push( bgGame.field.locus['seq' + (pos+1)] );
		}

		// от животных - очки
		if ( chip.info.groupe == GROUPE_ANIMAL ) {
			var count = 0,
				animGr = Math.floor( (chip.info.variant - 29) / 3 );

			for (var i in area) {
				var l = area[i];

				if ( !l.chips.length ) continue;

				var val = l.chips[0].info.variant - 29,
					gr = Math.floor( val / 3 ),
					tp = val % 3,
					bonus = (this.knows('k7')) ? 1 : 0;

				if (gr == animGr) count += (2 + tp + bonus);
			}

			points += count;
			this.pointsInfo.push({ cod : SCORE_ANIMAL, info : animGr + '.' + ((chip.info.variant - 29)%3+2), amt : count });
			msgs.push( 'Введение животных: +' + count );
		}

		// от замка кубик-джокер
		if ( chip.info.groupe == GROUPE_CASTLE ) {
			var cube = this.getJokerCube();
			loc.locate( cube );
			chips.push( cube );
			dests.push( this.plan.locus['cubeJoker'] );
		}

		// от гостиницы 4 рабочих
		if ( chip.info.variant == VARIANT_BUILDING_HOTEL ) {
			for (var i=0; i<4; i++) {
				var ch = bgPacks.worker.getOne().genChip();
				loc.locate(ch);
				chips.push( ch );
				dests.push( this.plan.locus['worker'] );
			}
		}

		// от банка 2 серебра
		if ( chip.info.variant == VARIANT_BUILDING_BANK ) {
			for (var i=0; i<2; i++) {
				var ch = bgPacks.silver.getOne().genChip();
				loc.locate(ch);
				chips.push( ch );
				dests.push( this.plan.locus['silver'] );
			}
		}

		// от башни 4 очка
		if ( chip.info.variant == VARIANT_BUILDING_WATCHTOWER ) {
			points += 4;
			this.pointsInfo.push({ cod : SCORE_TOWER, info : 0, amt : 4 });
			msgs.push('Постройка сторожевой башни: +' + 4);
		}

		// от заполнения области очки
		var filled = true;
		for (var i in area) {
			var l = area[i];
			if ( !l.chips.length ) { filled = false; break; }
		}
		if (filled) {
			var tab = [1, 3, 6, 10, 15, 21, 28, 36],
				fillPoints = tab[ area.length - 1 ],
				phaseBonus = 12 - bgGame.phase * 2;
			points += fillPoints + phaseBonus;
			this.pointsInfo.push({ cod : SCORE_FILL, info : area.length, amt : fillPoints });
			this.pointsInfo.push({ cod : SCORE_FILLBONUS, info : bgGame.phase, amt : phaseBonus });

			msgs.push('Заполнение области: +' + (fillPoints + phaseBonus));
		}

		// итого очки
		if (points) {
			this.points += points;
			var pos = this.counterChip.locus.pos,
				newPos = pos + points;
			if (newPos >= 100) {
				newPos -= 100;
				var chip100 = bgPacks.point100[this.id].getOne().genChip();
				this.counterChip.locus.locate(chip100);
				chips.push( chip100 );
				dests.push( this.plan.locus['point100'] );
			}
			chips.push( this.counterChip );			
			dests.push( bgGame.field.locus['point' + newPos] );
		}

		// заполнение всего цвета => бонус
		var filled = true;
		for (var i in fullGroupe) {
			var l = fullGroupe[i];
			if ( !l.chips.length ) { filled = false; break; }
		}
		if (filled) {
			if ( bgGame.field.locus['bmax' + chip.info.groupe].chips.length ) {
				chips.push( bgGame.field.locus['bmax' + chip.info.groupe].chips[0] );
				dests.push( this.plan.locus['bonus'] );
			} else if ( bgGame.field.locus['bmin' + chip.info.groupe].chips.length ) {
				chips.push( bgGame.field.locus['bmin' + chip.info.groupe].chips[0] );
				dests.push( this.plan.locus['bonus'] );
			}
		}

		// технологии в перечень
		if ( chip.info.groupe == GROUPE_KNOWLEGE ) this.addKnowledge( chip.info.variant );

		if (chips.length) bgGame.animator.chipMoveAnimator.on(chips, dests, function() {

			bgGame.gamer().chipApplyActiveResult(chip);
		});
		else bgGame.gamer().chipApplyActiveResult(chip);


		// console.log( 'chipApplyPassiveResult end' );


		// теперь к активным эффектам
		// this.chipApplyActiveResult(chip);

		if ( msgs.length ) Plugin->floatPoints.start( msgs, x, y );
	}

	this.chipApplyActiveResult = function(chip) {
		if ( chip.info.groupe == GROUPE_SHIP ) {
			var goods = false;
			for (var i=1; i<7; i++) if ( bgGame.field.locus['goods' + i].chips.length ) { goods = true; break; }
			if (goods) {
				cofb.status.setGetGoods({dowble:false});
				return;
			}
		}

		if ( chip.info.variant == VARIANT_BUILDING_TRADEPOST ) {
			var goods = false;
			for (var i=0; i<3; i++) if ( this.plan.locus['goods' + i].chips.length ) { goods = true; break; }

			if (goods) {
				cofb.status.setTrade();
				return;
			}
		}

		var map = [ 125, 120, 133, 144, 223, 221, 235, 245, 324, 325, 330, 343, 420, 425, 434, 442, 522, 523, 535, 545, 625, 624, 631, 640 ];
		if ( chip.info.variant == VARIANT_BUILDING_SAWMILL ) {
			var chipExist = false;
			for (var i in map) {
				var loc = bgGame.field.locus['advCube' + map[i]];
				if ( loc.chips.length && loc.chips[0].info.groupe == GROUPE_BUILDING ) { chipExist = true; break; }
			}
			if (chipExist) {
				cofb.status.setGetBuilding();
				return;
			}
		}

		if ( chip.info.variant == VARIANT_BUILDING_CHURCH ) {
			var chipExist = false;
			for (var i in map) {
				var loc = bgGame.field.locus['advCube' + map[i]];
				if ( loc.chips.length 
				&& (loc.chips[0].info.groupe == GROUPE_MINE
				|| loc.chips[0].info.groupe == GROUPE_CASTLE
				|| loc.chips[0].info.groupe == GROUPE_KNOWLEGE) ) { chipExist = true; break; }
			}
			if (chipExist) {
				cofb.status.setGetMCK();
				return;
			}
		}

		if ( chip.info.variant == VARIANT_BUILDING_MARKET ) {
			var chipExist = false;
			for (var i in map) {
				var loc = bgGame.field.locus['advCube' + map[i]];
				if ( loc.chips.length 
				&& (loc.chips[0].info.groupe == GROUPE_ANIMAL
				|| loc.chips[0].info.groupe == GROUPE_SHIP) ) { chipExist = true; break; }
			}
			if (chipExist) {
				cofb.status.setGetAS();
				return;
			}
		}

		if ( chip.info.variant == VARIANT_BUILDING_TOWNHALL ) {
			var chipExist = false;
			for (var i=0; i<3; i++) {
				var loc = this.plan.locus['advWait' + i];
				if ( loc.chips.length ) { chipExist = true; break; }
			}
			if (chipExist) {
				cofb.status.setSetChip();
				return;
			}
		}

		// console.log( 'chipApplyActiveResult end' );

		cofb.status.setPending();
	}

	this.getGoods = function(chip) {
		var map = [-1, -1, -1];
		for (var i=0; i<3; i++) {
			var loc = this.plan.locus['goods' + i];
			if ( !loc.chips.length ) continue;

			map[i] = loc.chips[0].info.variant;
		}

		var sortGoods = [[], [], []];
		var goods = chip.locus.chips;
		for (var i in goods) {
			var sorted = false;
			for (var j in map) {
				if (goods[i].info.variant == map[j]) { sortGoods[j].push(goods[i]); sorted = true; }
			}

			if (!sorted)
				for (var j in map) if (map[j] == -1) {
					map[j] = goods[i].info.variant;
					sortGoods[j].push(goods[i]);
					break;
				}
		}

		var chips = [], dests = [];

		for (var i in sortGoods) {
			for (var j in sortGoods[i]) {
				chips.push( sortGoods[i][j] );
				dests.push( this.plan.locus['goods' + i] );
			}
		}

		this.goodsUsed = +chip.locus.name[5];
		function check5() {
			var gamer = bgGame.gamer();
			if (!gamer.knows('k5')) {
				gamer.goodsUsed = 0;
				cofb.status.setPending();
				return;
			}

			if (gamer.dowbleGoods == 1) {
				gamer.dowbleGoods = 0;
				gamer.goodsUsed = 0;
				cofb.status.setPending();
				return;
			}

			var p = gamer.goodsUsed + 1,
				m = gamer.goodsUsed - 1;
			if (p > 6) p = 1;
			if (m < 1) m = 6;

			if ( !bgGame.field.locus['goods' + p].chips.length && !bgGame.field.locus['goods' + m].chips.length ) {
				gamer.dowbleGoods = 0;
				gamer.goodsUsed = 0;
				cofb.status.setPending();
				return;
			}

			gamer.dowbleGoods = 1;
			cofb.status.setGetGoods({dowble:true});
		}

		if (chips.length) {
			// console.log('Отправляю check5');
			bgGame.animator.chipMoveAnimator.on(chips, dests, function() { check5(); });
		} else check5();
	}
}
/* bgGamer */
//=============================================================================================================================




//=============================================================================================================================
/* bgGame *//********************************************
	baseInit()
	prepareField()
	preparePacks()
	reset()
	onStatusChange(newStatus)
	applyCubeResult()
	addGamer(id, sequence)
	gamer()
	locateAdvChips(amt)
	locateChipsToStart(amt)
	start(gamers, sequence, ai)
	nextPhase()
	nextRound()
	findNextGamer()
	turnsBegin()
	prepareForMining()
	calcFinalScore()
	phaseEndAnalis()
	phaseEnd()
	passMove()
	checkChipClick (chip, event, point)
	checkChipWhilePending(chip, event)
	checkChipOnUseSilver(chip)
	checkChipOnUseCube(chip, event, intersectPoint)
	checkGetGoods(chip)
	checkTrade(chip, event)
	checkGetChip(chip, groupes)
	checkSetChip(chip, event)

********************************************************/

var bgGame = {
	field : undefined,
	gamers : [],
	gamerKeys : [],
	cube : undefined,
	animator : undefined,

	activeCube : undefined,

	phase : 0,
	round : 0,

	activeGamer : -1,

	baseInit : function() {
		this.animator = new bgAnimation();

		cofb.EventSupervisor.subscribe({
			cofb_status_changed: [this, this.onStatusChange],
			cofb_chip_clicked: [this, this.checkChipClick],
			cofb_active_cube_changed: ()=>bgPulsator.on()
		});

		bgPulsator.init();
	},

	prepareField : function() {
		this.field = new bgField();
		this.cube = new bgCube(-1, 0);
		this.field.locus['cube'].locate( this.cube );
	},

	preparePacks : function() {
		bgPacks.init();
		bgPacks.shuffle();
	},

	reset : function() {
		for (var i in this.field.locus) {
			if (i == 'cube') continue;
			this.field.locus[i].delChips();
		}
		for (var i in this.gamers)
			this.gamers[i].clear();
	
		this.activeCube = undefined;
		this.phase = 0;
		this.round = 0;
		this.activeGamer = -1;
		this.gamers = [];
		this.gamerKeys = [];

		bgPacks.clear();
		this.preparePacks();
	},

	onStatusChange : function(newStatus) {
		if (cofb.status.isAI()) {
			bgAI.setGamer( this.gamer() );
			return;
		}

		if (this.gamer() && this.gamer().AI) {
			cofb.status.setAI();
			return;
		}

		cofb.world.clearSpiritStaff();

		if (this.activeGamer != -1) {
			var gamer = this.gamer();
			if (!gamer.plan.locus['cube0'].chips.length
			&& !gamer.plan.locus['cube1'].chips.length
			&& !gamer.plan.locus['cubeJoker'].chips.length) cofb.EventSupervisor.trigger('cofb_gamer_move_ends');
		}

		switch (true) {
			case cofb.status.isPhaseActivate():
			case cofb.status.isPlayOutCubes(): cofb.world.cameraAnimator.on(this.field.mesh.position); break;
		}

		bgPulsator.on();
	},

	applyCubeResult : function() {
		var r = this.round,
			loc = this.field.locus['tn' + r],
			chip = loc.chips[0],
			dest = this.field.locus[ 'goods' + this.cube.value ];

		this.animator.chipMoveAnimator.on( chip, dest, function() {
			bgGame.turnsBegin();
		});
	},

	addGamer : function(id, sequence) {
		var gamer = new bgGamer(id, sequence);
		var key = 'g' + id;
		this.gamerKeys.push( key );
		this.gamers[key] = gamer;
		return gamer;
	},

	gamer : function() {
		if (this.activeGamer == -1) return null;
		return this.gamers['g' + this.activeGamer];
	},

	locateAdvChips : function(amt) {
		if (amt == undefined) amt = this.gamerKeys.length;

		var cubeLocs = [],
			sellLocs = [];
		for (var i in this.field.locus) {
			var l = this.field.locus[i];
			if (l.amt <= amt) {
				if (l.type == LOCUS_ADVANTAGE_CUBE) cubeLocs.push( this.field.locus[i] );
				if (l.type == LOCUS_ADVANTAGE_FORSALE) sellLocs.push( this.field.locus[i] );
			}
		} 

		for (var i in cubeLocs) {
			var loc = cubeLocs[i];
			var chipInfo;
			if (loc.groupe2 != undefined && amt == 3 && (this.phase == 1 || this.phase == 3))
				chipInfo = bgPacks.advPack[loc.groupe2].getOne();
			else chipInfo = bgPacks.advPack[loc.groupe].getOne();
			var chip = chipInfo.genChip();
			loc.locate(chip);
		}

		for (var i in sellLocs) {
			var loc = sellLocs[i];
			var chipInfo = bgPacks.black.getOne();
			var chip = chipInfo.genChip();
			loc.locate(chip);
		}
	},

	locateChipsToStart : function(amt) {
		if (amt == undefined) amt = this.gamerKeys.length;

		this.locateAdvChips(amt);

		var goods = [];
		for (var i=0; i<25; i++) goods.push( bgPacks.goods.getOne() );

		for (var i in goods) {
			var chip = goods[i].genChip();
			chip.turn();
			var loc = this.field.locus['st' + (Math.floor(i / 5) + 1)];
			loc.locate(chip);
		}

		for (var i=0; i<6; i++) {
			var bmax = bgPacks.bonusMax.getOne(),
				bmin = bgPacks.bonusMin.getOne();

			this.field.locus['bmax' + i].locate( bmax.genChip() );
			this.field.locus['bmin' + i].locate( bmin.genChip() );
		}
	},

	/**
	 * data: [
	 *	{num:0, seg:1, ai:false},
	 *	{{num:1, seg:2, ai:false}}
	 * ]
	 * */
	start : function(data) {
		data.sort(function(a, b) {
			if (a.seg > b.seg) return 1;
			if (a.seg < b.seg) return -1;
			return 0;
		});

		var indent = cofb.FIELD_SIZE * 0.02,
			planW = cofb.FIELD_SIZE * 0.7,
			planD = planW * 0.723,
			zShift = (this.field.sizes[2] + planD) * 0.5 + indent,
			xShift = (planW + indent) * 0.5;

		var arr;
		if (data.length == 3) arr = [ [-xShift, 0, zShift], [xShift, 0, zShift], [0, 0, -zShift] ];
		else arr = [ [-xShift, 0, zShift], [xShift, 0, zShift], [-xShift, 0, -zShift], [xShift, 0, -zShift] ];

		for (var i=0; i<data.length; i++) {
			var gamer = this.addGamer( data[i].num, data.length - i );
			gamer.AI = data[i].ai;
			var chip = gamer.sequenceChip;
			this.field.locus['seq0'].locate( chip );
			chip = gamer.counterChip;
			this.field.locus['point0'].locate( chip );

			var plan = gamer.plan;
			plan.setPosition( arr[i] );
		}

		this.locateChipsToStart();
		cofb.status.setPhaseActivate();
	},

	nextPhase : function() {
		for (var i in this.gamers) this.gamers[i].round = 0;
		this.phase++;
		this.nextRound();
	},

	nextRound : function() {
		for (var i in this.gamers) this.gamers[i].reset();
		this.round++;
		cofb.status.setPlayOutCubes();
	},

	findNextGamer : function() {
		this.activeGamer = -1;
		var find = false;
		for (var i=6; i>=0; i--) {
			var loc = this.field.locus['seq' + i];

			for (var j=loc.chips.length-1; j>=0; j--) {
				var chip = loc.chips[j],
					id = chip.info.id,
					gamer = this.gamers['g' + id];

				if (gamer.round < this.round) { this.activeGamer = id; find = true; }
				if (find) break;
			}

			if (find) break;
		}
	},

	turnsBegin : function() {
		this.findNextGamer();
		this.gamer().activate();
	},

	prepareForMining : function() {
		var chips = [], dests = [];

		for (var i in this.gamers) {
			var g = this.gamers[i];
			for (var j=0; j<37; j++) {
				var loc = g.plan.locus['advLoc' + j];

				if ( loc.chips.length && loc.chips[0].info.groupe == GROUPE_MINE ) {
					var chip = bgPacks.silver.getOne().genChip();
					loc.locate(chip);
					chips.push( chip );
					dests.push( g.plan.locus['silver'] );

					if (g.knows('k2')) {
						var chip = bgPacks.worker.getOne().genChip();
						loc.locate(chip);
						chips.push( chip );
						dests.push( g.plan.locus['worker'] );
					}
				}
			}
		}

		return [ chips, dests ];
	},

	calcFinalScore : function() {
		for (var i in this.gamers) {
			var g = this.gamers[i];

			var workers = Math.floor( g.plan.locus['worker'].chips.length * 0.5 );
			if (workers)
				g.pointsInfo.push({ cod : SCORE_WORKER, info : g.plan.locus['worker'].chips.length, amt : workers });

			var silver = g.plan.locus['silver'].chips.length;
			if (silver)
				g.pointsInfo.push({ cod : SCORE_SILVER, info : 0, amt : silver });

			var goods = g.plan.locus['goods0'].chips.length +
				g.plan.locus['goods1'].chips.length +
				g.plan.locus['goods2'].chips.length;
			if (goods)
				g.pointsInfo.push({ cod : SCORE_LOSTGOODS, info : 0, amt : goods });

			for (var j=0; j<g.plan.locus['bonus'].chips.length; j++) {
				var chip = g.plan.locus['bonus'].chips[j];
				var points;
				if (chip.info.groupe == GROUPE_BONUS_MIN) points = 0;
				else points = 3;
				points += this.gamerKeys.length;
				g.pointsInfo.push({ cod : SCORE_BONUS, info : chip.info.variant, amt : points });
			}

			if (g.knows('k15')) {
				var goodsTypes = [0, 0, 0, 0, 0, 0];
				for (var j in g.plan.locus['goods'].chips) {
					var chip = g.plan.locus['goods'].chips[j];
					goodsTypes[ chip.info.variant - 1 ] = 1;
				}
				var total = 0;
				for (var j in goodsTypes) total += goodsTypes[j];
				if (total)
					g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_15, amt : total * 3 });
			}

			if (g.knows('k25')) {
				var goods = g.plan.locus['goods'].chips.length;
				if (goods)
					g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_25, amt : goods });
			}

			if (g.knows('k26')) {
				var bonus = g.plan.locus['bonus'].chips.length;
				if (bonus)
					g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_26, amt : bonus * 2 });
			}

			var store = 0,
				tower = 0,
				sawmill = 0,
				temple = 0,
				market = 0,
				hotel = 0,
				bank = 0,
				townhall = 0,
				animal = [0, 0, 0, 0];
			for (var j=0; j<37; j++) {
				var loc = g.plan.locus['advLoc' + j];
				if (!loc.chips.length) continue;

				var chip = loc.chips[0];

				if ( chip.info.groupe == GROUPE_BUILDING ) {
					switch (chip.info.variant) {
						case VARIANT_BUILDING_SAWMILL : sawmill++; break;
						case VARIANT_BUILDING_TRADEPOST : store++; break;
						case VARIANT_BUILDING_WATCHTOWER : tower++; break;
						case VARIANT_BUILDING_CHURCH : temple++; break;
						case VARIANT_BUILDING_MARKET : market++; break;
						case VARIANT_BUILDING_HOTEL : hotel++; break;
						case VARIANT_BUILDING_BANK : bank++; break;
						case VARIANT_BUILDING_TOWNHALL : townhall++; break;
					}
					continue;
				}

				if ( chip.info.groupe != GROUPE_ANIMAL ) continue;

				var gr = Math.floor( (chip.info.variant - 29) / 3 );
				animal[gr] = 1;
			}
			var animals = 0;
			for (var j in animal) animals += animal[j];

			if (g.knows('k16')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_16, amt : store * 4 });
			if (g.knows('k17')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_17, amt : tower * 4 });
			if (g.knows('k18')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_18, amt : sawmill * 4 });
			if (g.knows('k19')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_19, amt : temple * 4 });
			if (g.knows('k20')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_20, amt : market * 4 });
			if (g.knows('k21')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_21, amt : hotel * 4 });
			if (g.knows('k22')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_22, amt : bank * 4 });
			if (g.knows('k23')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_23, amt : townhall * 4 });
			if (g.knows('k24')) g.pointsInfo.push({ cod : SCORE_KNOWELEGE, info : VARIANT_KNOWLEDGE_24, amt : animals * 4 });
		}
	},

	phaseEndAnalis : function() {
		if (this.phase < 5) {
			for (var i in this.field.locus) {
				var l = this.field.locus[i];
				if (l.type == LOCUS_ADVANTAGE_CUBE || l.type == LOCUS_ADVANTAGE_FORSALE) l.delChips();
			}
			this.round = 0;
			for (var i in this.gamers) this.gamers[i].round = 0;
			this.locateAdvChips();
			cofb.status.setPhaseActivate();
		} else {
			this.calcFinalScore();
			cofb.status.setOver();
		}
	},

	phaseEnd : function() {
		var mining = this.prepareForMining();

		this.animator.chipMoveAnimator.on(mining[0], mining[1], function() { bgGame.phaseEndAnalis(); });
	},

	passMove : function() {
		this.findNextGamer();

		if (this.activeGamer != -1) {
			this.gamer().activate();
		} else {
			// новый раунд
			if (this.round < 5) this.nextRound();
			// фаза закончилась
			else this.phaseEnd();
		}
	},

	checkChipClick : function (chip, event, intersectPoint) {
		if ( this.activeGamer != -1 && this.gamer().AI ) return;

		switch (true) {

			case cofb.status.isPlayOutCubes() : {
				if ( chip.name.substr(0, 4) != 'cube' ) return;

				var cubes = [ this.cube ];
				for (var i in this.gamers) {
					cubes.push( this.gamers[i].cubes[0] );
					cubes.push( this.gamers[i].cubes[1] );
				}

				this.animator.cubeAnimator.on( cubes );
			} break;

			case cofb.status.isPhaseActivate() : {
				if ( chip.info == undefined ) return;
				var info = chip.info;
				if ( info.groupe != GROUPE_GOODS ) return;
				if ( chip.locus.name.substr(0, 2) != 'st' ) return;
				if ( +chip.locus.name[2] - 1 != this.phase ) return;

				this.animator.phaseAnimator.on( chip.locus );
			} break;


			case cofb.status.isPending() : this.checkChipWhilePending( chip, event ); break;
			case cofb.status.isUseSilver() : this.checkChipOnUseSilver(chip); break;
			case cofb.status.isUseCube() : this.checkChipOnUseCube(chip, event, intersectPoint); break;

			case cofb.status.isGetGoods() : this.checkGetGoods(chip); break;
			case cofb.status.isTrade() : this.checkTrade(chip, event); break;

			case cofb.status.isGetBuilding() : this.checkGetChip(chip, [ GROUPE_BUILDING ]); break;
			case cofb.status.isGetMCK() : this.checkGetChip(chip, [ GROUPE_MINE, GROUPE_CASTLE, GROUPE_KNOWLEGE ]); break;
			case cofb.status.isGetAS() : this.checkGetChip(chip, [ GROUPE_ANIMAL, GROUPE_SHIP ]); break;

			case cofb.status.isSetChip() : this.checkSetChip(chip, event); break
		}
	},

	checkChipWhilePending : function(chip, event) {
		if ( chip.name.substr(0, 4) == 'cube' ) {
			if ( chip.id != this.activeGamer ) return;
			if ( chip.locus.name == 'cubeRest' ) return;

			this.activeCube = chip;

			cofb.status.setUseCube({
				value: chip.value,
				event
			});
			return;
		}

		if ( chip.info == undefined ) return;

		if ( chip.info.groupe == GROUPE_SILVER ) {
			if ( chip.locus.parent.gamer.id != this.activeGamer ) return;
			if ( chip.locus.chips.length < 2 ) return;
			if ( this.gamer().silverUsed ) return;

			cofb.status.setUseSilver({event});
			return;
		}

		if ( chip.locus.name.substr(0, 7) == 'advWait' && chip.locus.parent.gamer.id == this.activeGamer ) {
			Plugin->confirmPopup.open('Уверены, что хотите сбросить эту фишку из игры?', ()=>{
				chip.del();
			});
		}
	},

	checkChipOnUseSilver : function(chip) {
		if ( chip.info == undefined ) return;

		if ( chip.info.groupe == GROUPE_SILVER && chip.locus.parent.gamer.id == this.activeGamer ) {
			cofb.status.setPending();
			return;
		}

		var gamer = this.gamer();
		if ( gamer.silverUsed ) return;
		if ( gamer.freeAdvSlot() == null ) return;

		var loctype = chip.locus.name.substr(0, 7);
		if ( loctype == 'advSell' || ( loctype == 'advCube' && gamer.knows('k6') ) ) {
			gamer.bye(chip);
		}
	},

	checkChipOnUseCube : function(chip, event, intersectPoint) {
		if ( chip === this.activeCube ) {
			this.activeCube = undefined;
			cofb.status.setPending();
			return;
		}

		var gamer = this.gamer();

		// использование, добавление рабочих
		if ( chip.area !== undefined ) {
			if ( chip !== gamer.plan ) return;
			if ( chip.locus['worker'].chips.length ) return;

			var x = gamer.plan.mesh.position.x + gamer.plan.locus['worker'].x * cofb.FIELD_SIZE,
				z = gamer.plan.mesh.position.z + gamer.plan.locus['worker'].z * cofb.FIELD_SIZE,
				delta = 0.0625 * cofb.FIELD_SIZE;

			if ( intersectPoint.x > x + delta || intersectPoint.x < x - delta
				|| intersectPoint.z > z + delta || intersectPoint.z < z - delta ) return;

			Plugin->workerMenu.open();
			return;
		}

		// введение фишки в вотчину
		if ( chip.name.substr(0, 6) == 'spirit' ) {
			var locName = chip.name.split('.')[1],
				loc = gamer.plan.locus[locName],
				chip = cofb.world.getSpiritInitiator();

			cofb.world.clearSpiritStaff();
			gamer.applyChip(chip, loc, event.clientX, event.clientY);
			return;
		}

		if (chip.info == undefined) return;

		if (chip.info.groupe == GROUPE_WORKER && chip.locus.parent.gamer.id == this.activeGamer) {
			Plugin->workerMenu.open();
			return;
		}

		// продажа товаров
		if ( chip.locus.name.substr(0, 5) == 'goods' && chip.locus.name != 'goods' ) {
			if ( chip.locus.parent.gamer.id != this.activeGamer ) return;
			if ( this.activeCube.value != 7 && chip.info.variant != this.activeCube.value ) return;

			gamer.sellGoods( chip.locus, true, event.clientX, event.clientY );

			return;
		}

		// взятие фишки с игрового поля
		if ( chip.locus.name.substr(0, 7) == 'advCube' ) {
			if ( gamer.freeAdvSlot() == null ) return;
			var arr = [];
			if (this.activeCube.value == 7) arr = [1, 2, 3, 4, 5, 6];
			else if ( gamer.knows('k12') ) {
				var p = this.activeCube.value + 1,
					m = this.activeCube.value - 1;
				if (p > 6) p -= 6;
				if (m < 1) m += 6;
				arr = [ this.activeCube.value, p, m ];
			} else arr = [ this.activeCube.value ];

			var index = arr.indexOf( chip.locus.cube );
			if ( index == -1 ) return;

			gamer.getChip(chip);
			
			return;
		}

		// поиск вариантов для введения фишки в вотчину
		if ( chip.locus.name.substr(0, 7) == 'advWait' && chip.locus.parent.gamer.id == this.activeGamer ) {
			gamer.tryFindPlace( chip );
		}
	},

	checkGetGoods : function(chip) {
		if ( chip.info == undefined ) return;
		if ( chip.info.groupe != GROUPE_GOODS ) return;
		if ( chip.locus.parent !== this.field ) return;

		var gamer = this.gamer();

		if ( gamer.dowbleGoods == 1 ) {
			var old = +gamer.goodsUsed,
				now = +chip.locus.name[5],
				m = old - 1,
				p = old + 1;
			if (m < 1) m += 6;
			if (p > 6) p -= 6;

			if ( now != p && now != m ) return;
		}

		gamer.getGoods(chip);
	},

	checkTrade : function(chip, event) {
		if ( chip.info == undefined ) return;
		if ( chip.info.groupe != GROUPE_GOODS ) return;
		

		var gamer = this.gamer();
		if ( chip.locus.parent !== gamer.plan ) return;

		gamer.sellGoods( chip.locus, false, event.clientX, event.clientY );
	},

	checkGetChip : function(chip, groupes) {
		if ( chip.info == undefined ) return;
		if ( chip.info.groupe > GROUPE_BUILDING ) return;
		if ( chip.locus.parent !== this.field ) return;
		if ( chip.locus.name.substr(0, 7) == 'advSell' ) return;

		var match = false;
		for (var i in groupes) {
			var index = groupes.indexOf( chip.info.groupe );
			if ( index != -1 ) { match = true; break; }
		}

		if (!match) return;

		this.gamer().getChip(chip);
	},

	checkSetChip : function(chip, event) {
		var gamer = this.gamer();

		if ( chip.name.substr(0, 6) == 'spirit' ) {
			var locName = chip.name.split('.')[1],
				loc = gamer.plan.locus[locName],
				chip = cofb.world.getSpiritInitiator();

			cofb.world.clearSpiritStaff();
			gamer.applyChip(chip, loc, event.clientX, event.clientY);
			return;
		}


		if ( chip.info == undefined ) return;
		if ( chip.locus.parent !== gamer.plan ) return;
		if ( chip.locus.name.substr(0, 7) != 'advWait' ) return;

		this.activeCube = { value : 7 };
		gamer.tryFindPlace( chip );
	}
}
/* bgGame */
//=============================================================================================================================




//=============================================================================================================================
/* bgAnimation */
function bgAnimation() {
	this.cubeAnimator = new lx.Timer(500);
	this.cubeAnimator.on = function(cube) {
		if (this.inAction) return;

		if (cube.push == undefined)
			this.cube = [ cube ];
		else this.cube = cube;
		this.way = 100;
		this.y0 = this.cube[0].mesh.position.y;
		this.start();
	}

	this.cubeAnimator.whileCycle(function() {
		var k = this.shift(),
			shift;

		if ( k < 0.5 ) shift = this.way * k * 2;
		else shift = this.way * (1 - k) * 2;

		var x = lx.Math.randomInteger(0, 360) * Math.PI / 180,
			y = lx.Math.randomInteger(0, 360) * Math.PI / 180,
			z = lx.Math.randomInteger(0, 360) * Math.PI / 180;

		for (var i in this.cube) {
			var cube = this.cube[i];
			cube.mesh.rotation.x = x;
			cube.mesh.rotation.y = y;
			cube.mesh.rotation.z = z;
			cube.mesh.position.y = this.y0 + shift;
		}

		if (this.periodEnds()) {
			for (var i in this.cube) {
				var cube = this.cube[i];
				cube.mesh.rotation.x = 0;
				cube.mesh.rotation.y = 0;
				cube.mesh.rotation.z = 0;
				cube.genRandom();
			}

			this.cube = undefined;
			this.stop();

			bgGame.applyCubeResult();
		}
	});




	this.phaseAnimator = new lx.Timer(500);
	this.phaseAnimator.on = function(locus) {
		if (this.inAction) return;

		this.locus = locus;

		this.pos0 = [];

		for (var i in locus.chips) {
			var chip = locus.chips[i];

			this.pos0.push({
				x : chip.mesh.position.x,
				y : chip.mesh.position.y,
				z : chip.mesh.position.z
			});
		}

		this.start();
	}

	this.phaseAnimator.whileCycle(function() {
		var k = this.shift(),
			angle = -Math.PI * (1 - k);

		var y1 = bgGame.field.surface() + this.locus.chips[0].sizes[1] * 0.5;

		for (var i=0; i<5; i++) {
			var chip = this.locus.chips[i],
				dest = bgGame.field.locus['tn' + (i+1)],
				
				x1 = dest.parent.mesh.position.x + dest.x * cofb.FIELD_SIZE,
				z1 = dest.parent.mesh.position.z + dest.z * cofb.FIELD_SIZE,
				
				x0 = this.pos0[i].x,
				y0 = this.pos0[i].y,
				z0 = this.pos0[i].z,

				xShift = (x1 - x0) * k,
				yShift = (y1 - y0) * k,
				zShift = (z1 - z0) * k;

			chip.mesh.position.x = x0 + xShift;
			chip.mesh.position.y = y0 + yShift;
			chip.mesh.position.z = z0 + zShift;

			chip.mesh.rotation.z = angle;
		}

		if (this.periodEnds()) {

			var chips = [];
			for (var i in this.locus.chips) chips.push( this.locus.chips[i] );

			for (var i in chips) {
				var loc = bgGame.field.locus['tn' + (+i+1)];
				loc.locate(chips[i]);
			}

			this.locus = undefined;
			this.stop();

			bgGame.nextPhase();
		}
	});



	this.chipMoveAnimator = new lx.Timer(500);
	this.chipMoveAnimator.on = function(chip, dest, func) {
		if (this.inAction) return;

		// console.log(func);

		if (chip.push == undefined) {
			this.chip = [ chip ];
			this.dest = [ dest ];
		} else {
			this.chip = chip;
			this.dest = dest;
		}
		this.func = func;

		this.pos0 = [];
		for (var i in this.chip) {
			if (this.chip[i] == undefined || this.chip[i].mesh == undefined) this.pos0.push({});
			else this.pos0.push({
				x : this.chip[i].mesh.position.x,
				y : this.chip[i].mesh.position.y,
				z : this.chip[i].mesh.position.z
			});
		}

		this.start();
		// console.log(this.func);
	};

	this.chipMoveAnimator.whileCycle(function() {
		var k = this.shift();

		for (var i in this.chip) {
			var chip = this.chip[i];
			if (chip == undefined || chip.mesh == undefined) continue;
			var dest = this.dest[i],
				crd = dest.coords(),
				x1 = crd[0],
				y1 = crd[1],
				z1 = crd[2],
				x0 = this.pos0[i].x,
				y0 = this.pos0[i].y + chip.sizes[1] * 0.5,
				z0 = this.pos0[i].z,
				xShift = (x1 - x0) * k,
				yShift = (y1 - y0) * k,
				zShift = (z1 - z0) * k;

			chip.mesh.position.x = x0 + xShift;
			chip.mesh.position.y = y0 + yShift;
			chip.mesh.position.z = z0 + zShift;
		}

		// console.log('action ', this.func);

		if (this.periodEnds()) {
			for (var i in this.chip) if ( this.chip[i] != undefined && this.chip[i].mesh != undefined ) this.dest[i].locate( this.chip[i] );

			this.chip = undefined;
			this.dest = undefined;
			this.pos0 = undefined;

			// console.log('timer ', this.func);

			this.stop();
			var func = this.func;
			this.func = undefined;
			if (func != undefined) func();
		}
	});

}
/* bgAnimation */
//=============================================================================================================================




//=============================================================================================================================
/* bgPulsator */
var bgPulsator = {
	animator : undefined,

	init : function() {
		this.animator = new lx.Timer(500);

		this.animator.chips = [];
		this.animator.baseVectors = [];
		this.animator.k = 0.2;
		this.animator.extand = true;

		this.animator.on = function( mode ) {
			this.extand = mode;
			this.start();
		};

		this.animator.whileCycle(function() {
			var shift = this.shift(),
				k, blue;
			if ( this.extand ) {
				k = 1 + this.k * shift;
				blue = 1 - shift;
			} else {
				k = 1 + this.k - this.k * shift;
				blue = shift;
			}

			for (var i in this.chips) {
				for (var j in this.chips[i].mesh.geometry.vertices) {
					this.chips[i].mesh.geometry.vertices[j].copy( this.baseVectors[i][j] );
					this.chips[i].mesh.geometry.vertices[j].multiplyScalar(k);
				}
				this.chips[i].mesh.geometry.verticesNeedUpdate = true;

				if (this.chips[i].value == undefined) this.chips[i].setColor([1, 1, blue]);
			}

			if ( this.periodEnds() ) {
				this.on( !this.extand );
			}
		});

		this.animator.off = function() {
			for (var i in this.baseVectors) {
				for (var j in this.baseVectors[i]) {
					this.chips[i].mesh.geometry.vertices[j].copy( this.baseVectors[i][j] );
				}
				this.chips[i].mesh.geometry.verticesNeedUpdate = true;
				if (this.chips[i].value == undefined) this.chips[i].setColor([1, 1, 1]);
			}

			this.baseVectors = [];
			this.stop();
		};
	},

	start : function( chips ) {
		this.animator.off();

		for (var i in chips) {
			var c = chips[i];
			this.animator.baseVectors.push([]);
			for (var j in c.mesh.geometry.vertices) {
				var v = new THREE.Vector3();
				v.copy( c.mesh.geometry.vertices[j] );
				this.animator.baseVectors[i].push(v);
			}
		}

		this.animator.chips = chips;
		this.animator.on(true);
	},

	cubePM : function(num) {
		var p = num + 1,
			m = num - 1;

		if ( p == 7 ) p = 1;
		if ( m == 0 ) m = 6;

		return [ m, num, p ];
	},

	on : function() {
		if (bgGame.activeGamer != -1 && bgGame.gamer().AI) {
			this.animator.off();
			return;
		}

		switch (true) {

			case cofb.status.isPhaseActivate() : {
				var loc = bgGame.field.locus['st' + (bgGame.phase+1)];

				var chips = [];
				for ( var i in loc.chips ) chips.push( loc.chips[i] );

				this.start( chips );
			} break;
			
			case cofb.status.isPlayOutCubes() : {
				var chips = [ bgGame.cube ];
				for (var i in bgGame.gamers) {
					chips.push( bgGame.gamers[i].cubes[0] );
					chips.push( bgGame.gamers[i].cubes[1] );
				}

				this.start( chips );
			} break;

			case cofb.status.isPending() : {
				var chips = [],
					gamer = bgGame.gamer();

				for (var i in gamer.plan.locus['cube0'].chips) chips.push( gamer.plan.locus['cube0'].chips[i] );
				for (var i in gamer.plan.locus['cube1'].chips) chips.push( gamer.plan.locus['cube1'].chips[i] );
				for (var i in gamer.plan.locus['cubeJoker'].chips) chips.push( gamer.plan.locus['cubeJoker'].chips[i] );
				if ( !gamer.silverUsed && gamer.plan.locus['silver'].chips.length > 1 )
					for (var i in gamer.plan.locus['silver'].chips) chips.push( gamer.plan.locus['silver'].chips[i] );

				this.start( chips );
			} break;

			case cofb.status.isUseCube() : {
				var gamer = bgGame.gamer(),
					num = bgGame.activeCube.value,
					nums, chips = [];

				if ( gamer.knows('k12') ) nums = this.cubePM( num );
				else nums = [ num ];

				for (var i in bgGame.field.locus) {
					if ( i.substr(0, 7) != 'advCube' ) continue;
					var loc = bgGame.field.locus[i];
					if ( nums.indexOf( loc.cube ) == -1 ) continue;

					for (var j in loc.chips)
						chips.push( loc.chips[j] );
				}

				for (var i in gamer.plan.locus['worker'].chips) chips.push( gamer.plan.locus['worker'].chips[i] );

				for (var i=0; i<3; i++) {
					if ( gamer.plan.locus['goods' + i].chips.length && gamer.plan.locus['goods' + i].chips[0].info.variant == num )
						for (var j in gamer.plan.locus['goods' + i].chips) chips.push( gamer.plan.locus['goods' + i].chips[j] );

					if ( gamer.plan.locus['advWait' + i].chips.length )
						for (var j in gamer.plan.locus['advWait' + i].chips) chips.push( gamer.plan.locus['advWait' + i].chips[j] );
				}

				this.start( chips );
			} break;

			case cofb.status.isUseSilver() : {
				var chips = [];

				for (var i in bgGame.field.locus) {
					if ( !bgGame.field.locus[i].chips.length ) continue;

					var str = i.substr(0, 7);
					if ( str == 'advSell' ) chips.push( bgGame.field.locus[i].chips[0] );
					if ( bgGame.gamer().knows('k6') && str == 'advCube' ) chips.push( bgGame.field.locus[i].chips[0] );
				}

				this.start( chips );
			} break;

			case cofb.status.isTrade() : {
				var chips = [],
					locus = bgGame.gamer().plan.locus;

				for (var i=0; i<3; i++)
					if ( locus['goods' + i].chips.length )
						for (var j in locus['goods' + i].chips)
							chips.push( locus['goods' + i].chips[j] );

				this.start( chips );
			} break;

			case cofb.status.isGetBuilding() : {
				var chips = [];

				for (var i in bgGame.field.locus) {
					var loc = bgGame.field.locus[i];
					if ( !loc.chips.length ) continue;
					if ( i.substr(0, 7) != 'advCube' ) continue;
					if ( loc.groupe != GROUPE_BUILDING ) continue;

					chips.push( loc.chips[0] );
				}

				this.start( chips );
			} break;

			case cofb.status.isGetMCK() : {
				var chips = [];

				for (var i in bgGame.field.locus) {
					var loc = bgGame.field.locus[i];
					if ( !loc.chips.length ) continue;
					if ( i.substr(0, 7) != 'advCube' ) continue;
					if ( loc.groupe != GROUPE_MINE && loc.groupe != GROUPE_CASTLE && loc.groupe != GROUPE_KNOWLEGE ) continue;

					chips.push( loc.chips[0] );
				}

				this.start( chips );
			} break;

			case cofb.status.isGetAS() : {
				var chips = [];

				for (var i in bgGame.field.locus) {
					var loc = bgGame.field.locus[i];
					if ( !loc.chips.length ) continue;
					if ( i.substr(0, 7) != 'advCube' ) continue;
					if ( loc.groupe != GROUPE_ANIMAL && loc.groupe != GROUPE_SHIP ) continue;

					chips.push( loc.chips[0] );
				}

				this.start( chips );
			} break;

			case cofb.status.isSetChip() : {
				var chips = [],
					locus = bgGame.gamer().plan.locus;

				for (var i=0; i<3; i++)
					if ( locus['advWait' + i].chips.length )
						for (var j in locus['advWait' + i].chips)
							chips.push( locus['advWait' + i].chips[j] );

				this.start( chips );
			} break;

			case cofb.status.isGetGoods() : {
				var chips = [],
					gamer = bgGame.gamer(),
					locus = bgGame.field.locus;

				if ( gamer.knows('k5') && gamer.dowbleGoods == 1 ) {
					var nums = this.cubePM( gamer.goodsUsed );

					for (var i in locus['goods' + nums[0]].chips)
						chips.push( locus['goods' + nums[0]].chips[i] );
					for (var i in locus['goods' + nums[2]].chips)
						chips.push( locus['goods' + nums[2]].chips[i] );
				} else {
					for (var j=1; j<7; j++) {
						for (var i in locus['goods' + j].chips)
							chips.push( locus['goods' + j].chips[i] );
					}
				}

				this.start( chips );
			} break;

			default : this.animator.off();
		}
	}
}
/* bgPulsator */
//=============================================================================================================================




//=============================================================================================================================
/* bgAI */
function bgCondition() {
	this.parent = null;
	this.reason = null;
	this.actions = [];
	this.immediately = null;

	this.usefullActionIndex = 0;
	this.ends = [];

	// plan
	this.silverUsed = false;
	this.cubes = [0, 0];
	this.cubeJoker = [];
	this._barony = [];
	this.advWait = [0, 0, 0];  // {groupe, variant}
	this.workers = 0;
	this.silver = 0;
	this.goods = [0, 0, 0];  // {amt, cube}
	this._knows = [];

	// field
	this._advCube = [];  // {groupe, variant}
	this._advSell = [];  // {groupe, variant}
	this._fieldGoods = null;  // [ variant ]

	this.core = function() { return bgAI.conditionsTree; }

	this.initCore = function(gamer) {
		this.silverUsed = gamer.silverUsed;

		var locus = gamer.plan.locus;

		if (locus['cube0'].chips.length) this.cubes[0] = locus['cube0'].chips[0].value;
		if (locus['cube1'].chips.length) this.cubes[1] = locus['cube1'].chips[0].value;
		if (locus['cubeJoker'].chips.length)
			for (var i in locus['cubeJoker'].chips) this.cubeJoker.push(7);

		for (var i=0; i<37; i++) {
			var l = locus['advLoc' + i];
			if (l.chips.length) {
				var info = l.chips[0].info;
				this._barony['b' + i] = info.variant;
			}
		}

		for (var i=0; i<3; i++)
			if (locus['advWait' + i].chips.length) {
				var info = locus['advWait' + i].chips[0].info;
				this.advWait[i] = { groupe : info.groupe, variant : info.variant };
			}

		this.workers = locus['worker'].chips.length;
		this.silver = locus['silver'].chips.length;

		for (var i=0; i<3; i++)
			if (locus['goods' + i].chips.length) { this.goods[i] = { amt : locus['goods' + i].chips.length, cube : locus['goods' + i].chips[0].info.variant } }

		for (var i in gamer.knowledges) this._knows[i] = gamer.knowledges[i];

		this._fieldGoods = [];
		for (var i in bgGame.field.locus) {
			var l = bgGame.field.locus[i],
				name = l.name,
				subname = name.substr(0, 5);

			if (!l.chips.length) continue;

			if (subname == 'advCu') {
				this._advCube[ i ] = { groupe : l.chips[0].info.groupe, variant : l.chips[0].info.variant };
			} else if (subname == 'advSe') {
				this._advSell[ i ] = { groupe : l.chips[0].info.groupe, variant : l.chips[0].info.variant };
			} else if (subname == 'goods') {
				this._fieldGoods[ i ] = [];
				for (var j in l.chips) this._fieldGoods[ i ].push( l.chips[j].info.variant );
			}
		}
	}

	this.freeSlot = function() {
		var result = -1;
		for (var i=0; i<3; i++) if (this.advWait[i] == 0) return i;
		return result;
	}

	this.findPlace = function(barony, knows, groupe, variant, nums) {
		var locs = [],
			plan = bgGame.gamers[ bgGame.gamerKeys[0] ].plan,
			baronyLocus = plan.locus;

		for (var i=0; i<37; i++) {
			var name = 'advLoc' + i,
				key = 'b' + i;

			if ( key in barony ) continue;

			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
			//console.log( 'findPlace ', name, baronyLocus[name].groupe, groupe, variant );


			if (baronyLocus[name].groupe != groupe) continue;
			var index = nums.indexOf( baronyLocus[name].cube );
			if (index == -1) continue;

			var neib = plan.advLocNeiborNums(i);
			var fill = false;
			for (var j in neib) if ( 'b' + neib[j] in barony ) { fill = true; break; }
			if (!fill) continue;

			if ( groupe == GROUPE_BUILDING && !('k1' in knows) ) {
				var area = plan.areaNums(i);

				var match = false;
				for (var j in area) {
					if ( ('b' + area[j] in barony) && barony['b' + area[j]] == variant)
						{ match = true; break; }
				}

				if (match) continue;
			}

			locs.push(i);
		}

		return locs;
	}

	this.locateGoods = function(goods) {
		var map = [-1, -1, -1];
		for (var i in map) {
			if ( this.goods[i] == 0 ) continue;
			map[i] = this.goods[i].cube;
		}

		var sortGoods = [[], [], []];
		for (var i in goods) {
			var sorted = false;
			for (var j in map) {
				if (goods[i] == map[j]) { sortGoods[j].push(i); sorted = true; }
			}

			if (!sorted)
				for (var j in map) if (map[j] == -1) {
					map[j] = goods[i];
					sortGoods[j].push(i);
					break;
				}
		}
		return sortGoods;
	}

	this.checkSortGoodsEmpty = function(goods) {
		return ( !goods[0].length && !goods[1].length && !goods[2].length );
	}

	this.findActions = function() {
		function cubePM(num) {
			var p = num + 1,
				m = num - 1;
			if (p > 6) p -= 6;
			if (m < 1) m += 6;
			return [ m, num, p ];
		} 

		var core = this.core();
		this.actions = [];

		var freeSlot = this.freeSlot(),
			advCube = this.advCube(),
			barony = this.barony(),
			knows = this.knows();

		// заполнение для каждой группы
		var groupeFill = bgAI.groupeFilled(barony),
			groupeAmt = groupeFill.amount,
			groupeFilled = groupeFill.filled,
			groupePart = groupeFill.part,
			areasFilled = bgAI.areasFilled(barony),
			freeNeibors = bgAI.freeNeibors(barony),
			map = bgAI.planMap['g' + bgAI.gamer.id],
			plan = bgAI.gamer.plan;

		var groupeNeibAmt = [0, 0, 0, 0, 0, 0];
		for (var i in freeNeibors) {
			groupeNeibAmt[ plan.locus[ 'advLoc' + freeNeibors[i] ].groupe ]++;
		}

		var ctx = this;

		// для взятия фишки нужно ориентироваться на группу: долю заполненности цвета, количества в соседях, ЗНАНИЯ
		function getChipUsefullIndex(groupe, variant) {
			var grAmt = groupeFilled[ groupe ];
			for (var i=0; i<3; i++)
				if ( ctx.advWait[i].groupe == groupe ) grAmt++;
			if ( grAmt == groupeAmt[groupe] ) return -100;

			// здания с учетом повторения в городах
			if ( groupe == GROUPE_BUILDING && !('k1' in knows) ) {
				var free = false;
				for (var i in map) {
					var contains = false;
					for (var j in map[i].cells)
						if ( barony[ 'b' + map[i].cells[j] ] == variant )
							{ contains = true; break; }
					if (!contains) { free = true; break; }
				}

				if (!free) return -100;
			}

			// базовый коэффициент по заполненности цвета и количества потенциальных вариантов размещения
			var k = 1 + groupePart[groupe] * 1.7 + groupeNeibAmt[groupe] * 0.25;

			// рудники с учетом знаний
			if ( groupe == GROUPE_MINE ) {
				k += ( 5 - bgGame.phase ) * 0.5;
				if ('k2' in knows) k += 0.5;
			}

			// здания с учетом знаний
			if ( groupe == GROUPE_BUILDING ) {
				if ( variant == VARIANT_BUILDING_TRADEPOST && ('k16' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_WATCHTOWER && ('k17' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_SAWMILL && ('k18' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_CHURCH && ('k19' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_MARKET && ('k20' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_HOTEL && ('k21' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_BANK && ('k22' in knows) ) k += 0.5;
				else if ( variant == VARIANT_BUILDING_TOWNHALL && ('k23' in knows) ) k += 0.5;
			}

			// животные с учетом знаний
			if ( groupe == GROUPE_ANIMAL ) {
				var animals = [0, 0, 0, 0];

				for (var i in map) for (var j in map[i].cells) {
					var num = map[i].cells[j],
						gr = plan.locus['advLoc' + num].groupe;
					if ( gr == GROUPE_ANIMAL ) 
						animals[ Math.floor((barony[ 'b' + num ] - 29) / 3) ]++;
				}

				var animalsAmt = 0, animalsTotal = 0;
				for (var i in animals) if (animals[i]) {
					animalsAmt++;
					animalsTotal += animals[i];
				}

				var coGroupe = animals[ Math.floor((variant - 29) / 3) ];

				if ( 'k24' in knows && coGroupe == 0 ) k += 1;
				if ( 'k7' in knows ) k += 0.25;

				k += coGroupe * 0.5;
			}

			// знания
			if ( groupe == GROUPE_KNOWLEGE ) {
				k += 0.15;

				var buildings = [0, 0, 0, 0, 0, 0, 0, 0],
					animals = [0, 0, 0, 0],
					mines = 0,
					ships = 0;

				for (var i in map) for (var j in map[i].cells) {
					var num = map[i].cells[j],
						gr = plan.locus['advLoc' + num].groupe;
					if ( gr == GROUPE_BUILDING )
						buildings[ barony[ 'b' + num ] - 41 ]++;
					else if ( gr == GROUPE_ANIMAL ) 
						animals[ Math.floor((barony[ 'b' + num ] - 29) / 3) ]++;
					else if ( gr == GROUPE_MINE )
						mines++;
					else if ( gr == GROUPE_SHIP )
						ships++;
				}

				var animalsAmt = 0, animalsTotal = 0;
				for (var i in animals) if (animals[i]) {
					animalsAmt++;
					animalsTotal += animals[i];
				}

				if ( variant == VARIANT_KNOWLEDGE_2 ) k += mines * 0.4;

				if ( variant == VARIANT_KNOWLEDGE_16 ) k += buildings[ VARIANT_BUILDING_TRADEPOST - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_17 ) k += buildings[ VARIANT_BUILDING_WATCHTOWER - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_18 ) k += buildings[ VARIANT_BUILDING_SAWMILL - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_19 ) k += buildings[ VARIANT_BUILDING_CHURCH - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_20 ) k += buildings[ VARIANT_BUILDING_MARKET - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_21 ) k += buildings[ VARIANT_BUILDING_HOTEL - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_22 ) k += buildings[ VARIANT_BUILDING_BANK - 41 ] * 0.4;
				if ( variant == VARIANT_KNOWLEDGE_23 ) k += buildings[ VARIANT_BUILDING_TOWNHALL - 41 ] * 0.4;

				if ( variant == VARIANT_KNOWLEDGE_24 ) k += animalsAmt * 0.75;
				if ( variant == VARIANT_KNOWLEDGE_7 ) k += ( 3 - animalsTotal * 0.5 );

				if ( variant == VARIANT_KNOWLEDGE_3 ) k += ( 4 - ships * 0.75 );
				if ( variant == VARIANT_KNOWLEDGE_4 ) k += ( 3 - ships * 0.5 );
				if ( variant == VARIANT_KNOWLEDGE_5 ) k += ( 4 - ships * 0.75 );
				if ( variant == VARIANT_KNOWLEDGE_15 ) k += 3;
				if ( variant == VARIANT_KNOWLEDGE_25 ) k += 3;
			}

			// лодки
			if ( groupe == GROUPE_SHIP ) {
				k += 0.25;  // на порядок хода

				var emptyGoods = 0;
				for (var i in ctx.goods) if (ctx.goods[i] == 0) emptyGoods++;
				if (emptyGoods == 1) k += 0.25;
				else if (emptyGoods == 2) k += 0.5;
				else if (emptyGoods == 3) k += 1;

				if ('k3' in knows) k += 0.25;
				if ('k4' in knows) k += 0.1;
				if ('k5' in knows) k += 0.25;
				if ('k15' in knows) k += 0.25;
				if ('k25' in knows) k += 0.25;
			}

			return k;
		}

		// для выкладывания фишки нужно ориентироваться на долю заполненности области
		function setChipUsefullIndex(groupe, variant, dest) {
			var k = 1 + groupePart[groupe],
				index = bgAI.areaIndex(dest),
				filled = areasFilled[ index ];

			k += filled + 1 / map[index].cells.length;

			if (groupe == GROUPE_KNOWLEGE) {
				switch (variant) {
					case VARIANT_KNOWLEDGE_25 : k += 0.25 * bgGame.gamer().plan.locus['goods'].chips.length; break;
					case VARIANT_KNOWLEDGE_15 : k += 0.3 * bgGame.gamer().plan.locus['goods'].chips.length; break;
				}
			}

			return k * 1.7;
		}

		if (this.immediately != null) {

			switch (this.immediately) {
				case cofb.Status.GET_GOODS : {
					var fieldGoods = this.fieldGoods();

					var map = [0, 0, 0, 0, 0, 0];
					for (var i in fieldGoods) map[ +i[5] - 1 ] = 1;

					for (var i=0; i<6; i++) {
						if ( map[i] == 0 ) continue;

						var goods = [], fromArr = [ 'goods' + (i+1) ];
						for ( var j in fieldGoods['goods' + (i+1)] ) {
							goods.push( fieldGoods['goods' + (i+1)][j] );
						}

						if ('k5' in knows) {
							var ip = ( +i == 5 ) ? 0 : +i+1;
							if ( map[ip] != 0 ) {
								for ( var j in fieldGoods['goods' + (ip+1)] )
									goods.push( fieldGoods['goods' + (ip+1)][j] );
							}
							fromArr.push( 'goods' + (ip+1) );
						}

						var sortGoods = this.locateGoods(goods);
						if ( !this.checkSortGoodsEmpty(sortGoods) ) {
							var k = 1 + 0.15 * goods.length + 0.05 * (goods.length - 1);
							var kk = 1;
							if ('k3' in knows) kk += 0.2;
							if ('k4' in knows) kk += 0.1;
							if ('k15' in knows) kk += 0.2;
							if ('k25' in knows) kk += 0.2;
							if ('k5' in knows) kk += 0.3;
							k *= kk;
							this.actions.push({ type:bgAI.GET_GOODS, from: fromArr, usefullIndex : k });
						}
					}
				} break;

				case cofb.Status.TRADE : {
					for (var i in this.goods) {
						if ( this.goods[i] == 0 ) continue;
						var k = 1 + 0.1 * this.goods[i].amt;
						var kk = 1;
						if ('k3' in knows) kk += 0.2;
						if ('k4' in knows) kk += 0.1;
						if ('k15' in knows) kk += 0.2;
						if ('k25' in knows) kk += 0.2;
						k *= kk;
						this.actions.push({ type:bgAI.SELL_GOODS, by:-2, from:i, usefullIndex : k });
					}
				} break;

				case cofb.Status.GET_BUILDING : {
					if (freeSlot != -1) for (var i in advCube) {
						if ( advCube[i].groupe == GROUPE_BUILDING ) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

							this.actions.push({ type:bgAI.GET_CHIP, by:-2, from:i, to:freeSlot, usefullIndex : k });
						}
					}
				} break;

				case cofb.Status.GET_MCK : {
					if (freeSlot != -1) for (var i in advCube) {
						var gr = advCube[i].groupe;
						if ( gr == GROUPE_MINE || gr == GROUPE_CASTLE || gr == GROUPE_KNOWLEGE  ) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

							this.actions.push({ type:bgAI.GET_CHIP, by:-2, from:i, to:freeSlot, usefullIndex : k });
						}
					}
				} break;

				case cofb.Status.GET_AS : {
					if (freeSlot != -1) for (var i in advCube) {
						var gr = advCube[i].groupe;
						if ( gr == GROUPE_ANIMAL || gr == GROUPE_SHIP ) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

							this.actions.push({ type:bgAI.GET_CHIP, by:-2, from:i, to:freeSlot, usefullIndex : k });
						}
					}
				} break;

				case cofb.Status.SET_CHIP : {
					for (var i in this.advWait) {
						if ( this.advWait[i] == 0 ) continue;

						var groupe = this.advWait[i].groupe,
							variant = this.advWait[i].variant,
							nums = [1, 2, 3, 4, 5, 6];

						var locs = this.findPlace(barony, knows, groupe, variant, nums);
						for (var j in locs) {
							// рассчет индекса полезности
							var k = getChipUsefullIndex( groupe, variant, locs[j] );
						
							this.actions.push({ type:bgAI.SET_CHIP, by:-2, from:i, to:locs[j], usefullIndex : k });
						}
					}
				} break;
			}
			return;	
		}

		// купить за серебро
		if (!this.silverUsed && this.silver >= 2 && freeSlot != -1) {
			var advSell = this.advSell();

			for (var i in advSell) {
				// рассчет индекса полезности
				var k = getChipUsefullIndex( advSell[i].groupe, advSell[i].variant );

				this.actions.push({ type:bgAI.GET_CHIP, by:-1, from:i, to:freeSlot, usefullIndex : k });
			}

			if ('k6' in knows) for (var i in this.advCube) {
				// рассчет индекса полезности
				var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

				this.actions.push({ type:bgAI.GET_CHIP, by:-1, from:i, to:freeSlot, usefullIndex : k });
			}
		}

		// взять фишку с поля
		if (freeSlot != -1) {
			var nums0 = [ this.cubes[0] ],
				nums1 = [ this.cubes[1] ];

			if ('k12' in knows) {
				nums0 = cubePM( this.cubes[0] );
				nums1 = cubePM( this.cubes[1] );
			}

			for (var i in advCube) {
				var cube = +i[7];

				var index = nums0.indexOf( cube );
				if (index != -1) {
					// рассчет индекса полезности
					var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

					this.actions.push({ type:bgAI.GET_CHIP, by:0, from:i, to:freeSlot, usefullIndex : k });
				}

				if ( this.cubes[1] != this.cubes[0] ) {
					var index = nums1.indexOf( cube );
					if (index != -1) {
						// рассчет индекса полезности
						var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

						this.actions.push({ type:bgAI.GET_CHIP, by:1, from:i, to:freeSlot, usefullIndex : k });
					}
				}

				if (this.cubeJoker.length) {
					// рассчет индекса полезности
					var k = getChipUsefullIndex( advCube[i].groupe, advCube[i].variant );

					this.actions.push({ type:bgAI.GET_CHIP, by:2, from:i, to:freeSlot, usefullIndex : k });
				}
			}
		}

		// ввести фишку в вотчину
		for (var i in this.advWait) {
			if ( this.advWait[i] == 0 ) continue;

			var groupe = this.advWait[i].groupe,
				variant = this.advWait[i].variant;

			var nums0 = [ this.cubes[0] ],
				nums1 = [ this.cubes[1] ];

			if ( ('k9' in knows && groupe == GROUPE_BUILDING) 
			|| ( 'k10' in knows && (groupe == GROUPE_ANIMAL || groupe == GROUPE_SHIP) )
			|| ( 'k11' in knows && (groupe == GROUPE_MINE || groupe == GROUPE_CASTLE || groupe == GROUPE_KNOWLEGE) ) ) {
				nums0 = cubePM( this.cubes[0] );
				nums1 = cubePM( this.cubes[1] );
			}

			var locs = this.findPlace(barony, knows, groupe, variant, nums0);
			for (var j in locs) {
				// рассчет индекса полезности
				var k = setChipUsefullIndex(groupe, variant, locs[j]);

				this.actions.push({ type:bgAI.SET_CHIP, by:0, from:i, to:locs[j], usefullIndex : k });
			}

			if ( this.cubes[1] != this.cubes[0] ) {
				var locs = this.findPlace(barony, knows, groupe, variant, nums1);
				for (var j in locs) {
					// рассчет индекса полезности
					var k = setChipUsefullIndex(groupe, variant, locs[j]);

					this.actions.push({ type:bgAI.SET_CHIP, by:1, from:i, to:locs[j], usefullIndex : k });
				}
			}

			if (this.cubeJoker.length) {
				var nums = [1, 2, 3, 4, 5, 6];
				var locs = this.findPlace(barony, knows, groupe, variant, nums);
				for (var j in locs) {
					// рассчет индекса полезности
					var k = setChipUsefullIndex(groupe, variant, locs[j]);

					this.actions.push({ type:bgAI.SET_CHIP, by:2, from:i, to:locs[j], usefullIndex : k });
				}
			}
		}

		// использование рабочего
		if (this.workers != 0) {
			var baseCubes = core.cubes,
				p0 = false,
				m0 = false,
				p1 = false,
				m1 = false;

			if ( this.parent != null ) {
				var pB = this.parent.cubes[0] + 1;
				if (pB > 6) pB = 1;
				var mP = this.parent.cubes[0] - 1;
				if (mP < 1) mP = 6;
				if (this.cubes[0] == pB) p0 = true;
				if (this.cubes[0] == mP) m0 = true;

				var pB = this.parent.cubes[1] + 1;
				if (pB > 6) pB = 1;
				var mP = this.parent.cubes[1] - 1;
				if (mP < 1) mP = 6;
				if (this.cubes[1] == pB) p1 = true;
				if (this.cubes[1] == mP) m1 = true;
			}

			if ( this.cubes[0] != 0 && this.cubes[0] + 3 != baseCubes[0] && this.cubes[0] - 3 != baseCubes[0] ) {
				if (!p0) this.actions.push({ type:bgAI.USE_WORKER, cube:0, shift:-1, usefullIndex : 0 });
				if (!m0) this.actions.push({ type:bgAI.USE_WORKER, cube:0, shift: 1, usefullIndex : 0 });
			}
			if ( this.cubes[1] && this.cubes[1] + 3 != baseCubes[1] && this.cubes[1] - 3 != baseCubes[1] ) {
				if (!p1) this.actions.push({ type:bgAI.USE_WORKER, cube:1, shift:-1, usefullIndex : 0 });
				if (!m1) this.actions.push({ type:bgAI.USE_WORKER, cube:1, shift: 1, usefullIndex : 0 });
			}

			if ('k8' in knows) {
				if ( this.cubes[0] && this.cubes[0] + 2 != baseCubes[0] && this.cubes[0] - 2 != baseCubes[0] ) {
					if (!p0) this.actions.push({ type:bgAI.USE_WORKER, cube:0, shift:-2, usefullIndex : 0 });
					if (!m0) this.actions.push({ type:bgAI.USE_WORKER, cube:0, shift: 2, usefullIndex : 0 });
				}
				if ( this.cubes[1] && this.cubes[1] + 2 != baseCubes[1] && this.cubes[1] - 2 != baseCubes[1] ) {
					if (!p1) this.actions.push({ type:bgAI.USE_WORKER, cube:1, shift:-2, usefullIndex : 0 });
					if (!m1) this.actions.push({ type:bgAI.USE_WORKER, cube:1, shift: 2, usefullIndex : 0 });
				}
			}
		}

		// обмен на рабочего
		if (this.cubes[0] != 0) this.actions.push({ type:bgAI.GET_WORKER, by:0, usefullIndex : 0 });
		if (this.cubes[1] != 0) this.actions.push({ type:bgAI.GET_WORKER, by:1, usefullIndex : 0 });
		if (this.cubeJoker.length) this.actions.push({ type:bgAI.GET_WORKER, by:2, usefullIndex : 0 });

		// продажа товара
		for (var i in this.goods) {
			if ( this.goods[i] == 0 ) continue;
			var cube = this.goods[i].cube;

			var k = 1 + 0.1 * this.goods[i].amt;
			var kk = 1;
			if ('k3' in knows) kk += 0.2;
			if ('k4' in knows) kk += 0.1;
			if ('k15' in knows) kk += 0.2;
			if ('k25' in knows) kk += 0.2;
			k *= kk;

			if ( cube == this.cubes[0] ) this.actions.push({ type:bgAI.SELL_GOODS, by:0, from:i, usefullIndex : k });
			if ( this.cubes[1] != this.cubes[0] && cube == this.cubes[1] ) this.actions.push({ type:bgAI.SELL_GOODS, by:1, from:i, usefullIndex : k });
			if (this.cubeJoker.length) this.actions.push({ type:bgAI.SELL_GOODS, by:2, from:i, usefullIndex : k });
		}
	}

	this.setParent = function(cond) {
		this.parent = cond;

		this.silverUsed = cond.silverUsed;
		this.cubes = [ cond.cubes[0], cond.cubes[1] ];
		for (var i in cond.cubeJoker) this.cubeJoker[i] = cond.cubeJoker[i];
		for (var i in cond.advWait) this.advWait[i] = cond.advWait[i];
		this.workers = cond.workers;
		this.silver = cond.silver;
		for (var i in cond.goods) this.goods[i] = cond.goods[i];
	}

	this.barony = function() {
		if (this.parent == null) return this._barony;
		var b = [], pb = this.parent.barony();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._barony) b[i] = this._barony[i];
		return b;
	}

	this.knows = function() {
		if (this.parent == null) return this._knows;
		var b = [], pb = this.parent.knows();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._knows) b[i] = this._knows[i];
		return b;
	}

	this.advCube = function() {
		if (this.parent == null) return this._advCube;
		var b = [], pb = this.parent.advCube();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._advCube) delete b[i];
		return b;
	}

	this.advSell = function() {
		if (this.parent == null) return this._advSell;
		var b = [], pb = this.parent.advSell();
		for (var i in pb) b[i] = pb[i];
		for (var i in this._advSell) delete b[i];
		return b;
	}

	this.fieldGoods = function() {
		if ( this._fieldGoods == null ) return this.parent.fieldGoods();
		return this._fieldGoods;
	}
}




function bgArea() {
	this.cells = [];
	this.groupe = -1;

	this.contains = function(num) {
		return ( this.cells.indexOf(num) != -1 );
	}
}




var bgAI = {
	GET_CHIP : 0,
	SET_CHIP : 1,
	GET_GOODS : 2,
	SELL_GOODS : 3,
	GET_WORKER : 4,
	USE_WORKER : 5,

	conditionCounter : 0,

	gamer : undefined,
	conditionsTree : undefined,
	actions : [],
	active : false,

	planMap : [],



}

bgAI.genConditionsTree = function() {
	function useBy(cond, by) {
		if (by == -1) { cond.silver -= 2; cond.silverUsed = true; }
		if (by == 0) cond.cubes[0] = 0;
		if (by == 1) cond.cubes[1] = 0;
		if (by == 2) cond.cubeJoker.pop();
	}


	this.conditionsTree = new bgCondition();
	this.conditionsTree.initCore( this.gamer );


	bgAI.conditionCounter = 1;

	function rec( ctx ) {
		ctx.findActions();
		if (!ctx.actions.length) bgAI.conditionsTree.ends.push( ctx );

		// console.log( '!!!' );

		var amt;
		if ( ctx.immediately ) amt = ctx.actions.length;
		else amt = Math.floor( 2000 / bgAI.conditionCounter );
		var indexes = lx.Math.selectRandomKeys( ctx.actions, amt );

		for (var i in indexes) {
			var act = ctx.actions[ indexes[i] ];

			var knows = ctx.knows();

			// формируем новую реальность под каждое отдельное действие
			bgAI.conditionCounter++;
			var newCond = new bgCondition();
			newCond.setParent( ctx );
			newCond.reason = act;
			newCond.usefullActionIndex = ctx.usefullActionIndex + act.usefullIndex;

			// применяем к новой реальности изменения, вызванные действием
			switch ( act.type ) {
				case bgAI.GET_CHIP : {
					useBy( newCond, act.by );
					var info = bgGame.field.locus[act.from].chips[0].info;
					newCond.advWait[act.to] = { groupe : info.groupe, variant : info.variant };

					// console.log( newCond );
				} break;

				case bgAI.SET_CHIP : {
					useBy( newCond, act.by );

					var groupe = newCond.advWait[ act.from ].groupe;
						variant = newCond.advWait[ act.from ].variant;
					newCond._barony[ 'b' + act.to ] = variant;
					newCond.advWait[ act.from ] = 0;

					// группа животных для оценки
					// сторожевая башня для оценки

					switch (variant) {
						case VARIANT_SHIP : {
							var fieldGoods = newCond.fieldGoods();
							var find = false;
							for (var i in fieldGoods) { find = true; break; }
							if (find) newCond.immediately = cofb.Status.GET_GOODS;
						} break;
						case VARIANT_BUILDING_TRADEPOST : {
							if (newCond.goods[0] != 0 || newCond.goods[1] != 0 || newCond.goods[2] != 0)
								newCond.immediately = cofb.Status.TRADE;
						} break;
						case VARIANT_BUILDING_SAWMILL : {
							var advCube = newCond.advCube();
							var find = false;
							for (var i in advCube)
								if ( advCube[i].groupe == GROUPE_BUILDING ) { find = true; break; }
							if (find) newCond.immediately = cofb.Status.GET_BUILDING;
						} break;
						case VARIANT_BUILDING_CHURCH : {
							var advCube = newCond.advCube();
							var find = false;
							for (var i in advCube)
								if ( advCube[i].groupe == GROUPE_MINE || advCube[i].groupe == GROUPE_CASTLE || advCube[i].groupe == GROUPE_KNOWLEGE )
									{ find = true; break; }
							if (find) newCond.immediately = cofb.Status.GET_MCK;
						} break;
						case VARIANT_BUILDING_MARKET : {
							var advCube = newCond.advCube();
							var find = false;
							for (var i in advCube)
								if ( advCube[i].groupe == GROUPE_ANIMAL || advCube[i].groupe == GROUPE_SHIP ) { find = true; break; }
							if (find) newCond.immediately = cofb.Status.GET_AS;
						} break;
						case VARIANT_BUILDING_TOWNHALL : {
							if ( newCond.advWait[0] != 0 || newCond.advWait[1] != 0 || newCond.advWait[2] != 0 )
								newCond.immediately = cofb.Status.SET_CHIP;
						} break;
						case VARIANT_CASTLE : { newCond.cubeJoker.push(7); } break;
						case VARIANT_BUILDING_HOTEL : { newCond.workers += 4; } break;
						case VARIANT_BUILDING_BANK : { newCond.silver += 2; } break;
					}

					// console.log( newCond );
				} break;

				case bgAI.GET_GOODS : {
					// console.log( 'action GET_GOODS' );

					var fieldGoods = newCond.fieldGoods();

					var fg = [];
					for (var i in fieldGoods) {
						fg[i] = fieldGoods[i];
						for (var j in fieldGoods[i])
							fg[i][j] = fieldGoods[i][j];
					}
					newCond._fieldGoods = fg;

					var from = act.from;

					for (var i in from) {
						var name = from[i];

						var l = newCond._fieldGoods[name].length - 1;
						for (var j=l; j>=0; j--) {
							var goods = newCond._fieldGoods[name][j];

							var located = false;
							for (var g in newCond.goods) {
								if ( newCond.goods[g] != 0 && newCond.goods[g].cube == goods ) {
									newCond.goods[g].amt++;
									newCond._fieldGoods[name].splice(j, 1);
									located = true;
								}
							}
							if (!located) for (var g in newCond.goods) {
								if (newCond.goods[g] == 0) {
									newCond.goods[g] = { cube : goods, amt : 1 };
									newCond._fieldGoods[name].splice(j, 1);
									break;
								}
							}
						}
					}

					// console.log( newCond );
				} break;

				case bgAI.SELL_GOODS : {
					newCond.goods[ act.from ] = 0;
					useBy( newCond, act.by );
					newCond.silver++;
					if ('k3' in knows) newCond.silver++;
					if ('k4' in knows) newCond.workers++;

					// console.log( newCond );
				} break;

				case bgAI.GET_WORKER : {
					useBy( newCond, act.by );
					newCond.workers += 2;
					if ('k13' in knows) newCond.silver += 1;
					if ('k14' in knows) newCond.workers += 2;

					// console.log( newCond.workers, newCond.cubes );
				} break;

				case bgAI.USE_WORKER : {
					newCond.workers--;
					newCond.cubes[ act.cube ] += act.shift;
					if ( newCond.cubes[ act.cube ] > 6 ) newCond.cubes[ act.cube ] -= 6;
					if ( newCond.cubes[ act.cube ] < 1 ) newCond.cubes[ act.cube ] += 6;
				} break;
			}
		
			// ветвим новую реальность согласно ее возможным событиям
			rec( newCond );


			// console.log( '---' );
			// console.log( newCond.reason );
		}
	}

	rec( this.conditionsTree );




	this.conditionsTree.ends.sort(
		function(a, b) {
			if ( a.usefullActionIndex > b.usefullActionIndex ) return -1;
			if ( a.usefullActionIndex < b.usefullActionIndex ) return 1;
			return 0;
		}
	);
}

bgAI.delConditionsTree = function() {
	delete this.conditionsTree;
}

bgAI.genPlanMap = function() {
	if ( 'g' + this.gamer.id in this.planMap ) return;

	var arr = [];

	for (var i=0; i<37; i++) {

		var located = false;
		for (var j in arr) if ( arr[j].contains(i) ) { located = true; break; }
		if (located) continue;

		var area = new bgArea();
		area.cells = this.gamer.plan.areaNums(i);
		area.groupe = this.gamer.plan.locus['advLoc' + i].groupe;

		arr.push(area);
	}

	this.planMap[ 'g' + this.gamer.id ] = arr;
}

bgAI.freeNeibors = function(barony) {
	var arr = [];

	for (var i=0; i<37; i++) {

		var key = 'b' + i;

		var neib = [];
		if (key in barony) neib = this.gamer.plan.advLocNeiborNums(i);

		for (var j in neib)
			if ( !('b'+j in barony) ) arr['n' + neib[j]] = neib[j];
	}

	return arr;
}

bgAI.groupeFilled = function(barony) {
	var result = [0, 0, 0, 0, 0, 0],
		amt = [0, 0, 0, 0, 0, 0],
		fill = [0, 0, 0, 0, 0, 0],
		plan = this.gamer.plan;

	for (var i=0; i<37; i++) {
		var gr = plan.locus['advLoc' + i].groupe;
		amt[gr]++;
		if ( ('b' + i) in barony ) fill[gr]++;
	}

	fill[GROUPE_CASTLE]--;
	amt[GROUPE_CASTLE]--;

	for (var i in result) result[i] = fill[i] / amt[i];

	return { amount : amt, filled : fill, part : result };
}

bgAI.areasFilled = function(barony) {
	var map = this.planMap['g' + this.gamer.id];

	var result = [];

	for (var i in map) {
		var area = map[i];
		result.push(0);

		for (var j in area.cells)
			if ( 'b' + area.cells[j] in barony )
				result[i]++;

		result[i] = result[i] / area.cells.length;
	}

	return result;
}

bgAI.areaIndex = function(num) {
	var map = this.planMap['g' + this.gamer.id];

	for (var i in map)
		if (map[i].contains(num)) return i;

	return -1;
}

bgAI.setGamer = function(gamer) {

	console.log( 'setGamer' );

	this.gamer = gamer;
	this.genPlanMap();

	// если не активен, становится активен, создает дерево состояний, выбирает матрицу событий, начинает по ней идти
	if (!this.active) {
		console.log('activate ==========================================');
		this.active = true;
		this.genConditionsTree();

		var end = this.conditionsTree.ends[0];

		while ( end.parent != null ) {
			this.actions.push(end);
			end = end.parent;
		}

		this.actions[ this.actions.length - 1 ].parent = null;
		this.delConditionsTree();

		for (var i in this.actions)
			console.log( JSON.stringify( this.actions[i].reason ) );
	}

	// если активен - если есть действия в очереди, делает верхнее, удаляя из очереди. Если очередь пуста - становится неактивен, передает ход
	if (this.active) {

		if ( !this.actions.length ) {
			console.log('deactivate =============================================');
			this.active = false;
			bgGame.passMove();
			return;
		}

		var action = this.actions.pop(),
			reason = action.reason;

		// console.log( action );
		console.log( reason );

		// console.log( 'reason.type ', reason.type );
		switch ( reason.type ) {
			case this.GET_CHIP : {
				if (reason.by == -1) { this.gamer.bye( bgGame.field.locus[ reason.from ].chips[0] ); }
				else {
					if (reason.by != -2) {
						if (reason.by == 2) bgGame.activeCube = this.gamer.cubeJoker[0];
						else bgGame.activeCube = this.gamer.cubes[ reason.by ];
					}
					this.gamer.getChip( bgGame.field.locus[ reason.from ].chips[0] );
				}
			} break;
			
			case this.SET_CHIP : {
				var chip = this.gamer.plan.locus['advWait' + reason.from].chips[0];
					loc = this.gamer.plan.locus['advLoc' + reason.to];

				if (reason.by != -2) {
					if (reason.by == 2) bgGame.activeCube = this.gamer.cubeJoker[0];
					else bgGame.activeCube = this.gamer.cubes[ reason.by ];
				}
				this.gamer.applyChip(chip, loc)
			} break;
			
			case this.GET_GOODS : {
				var from = reason.from.pop();
				if ( reason.from.length ) this.actions.push( action );

				this.gamer.getGoods( bgGame.field.locus[ from ].chips[0] );
			} break;
			
			case this.SELL_GOODS : {
				var useCube;
				if (reason.by == -2) { useCube = false; }
				else {
					useCube = true;
					if (reason.by == 2) bgGame.activeCube = this.gamer.cubeJoker[0];
					else bgGame.activeCube = this.gamer.cubes[ reason.by ];
				}

				var locus = this.gamer.plan.locus['goods' + reason.from];
				this.gamer.sellGoods(locus, useCube)
			} break;
			
			case this.GET_WORKER : {
				if (reason.by == 2) bgGame.activeCube = this.gamer.cubeJoker[0];
				else bgGame.activeCube = this.gamer.cubes[ reason.by ];
				this.gamer.changeCubeToWorker();
			} break;
			
			case this.USE_WORKER : {
				this.gamer.plan.locus['worker'].delChips(1);
				this.gamer.cubes[ reason.cube ].incValue( reason.shift );
				cofb.status.setAI();
			} break;
		}
	}
}

/* bgAI */
//=============================================================================================================================
