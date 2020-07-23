#lx:macros evConst {lexedo.games.Evolution.Constants};

class Property #lx:namespace lexedo.games.Evolution {
	/*
	- жир
	- пауза (на раунд: топотун; на ход: хищник, мимикрия, пиратство, спячка)
	- стоп
	- слот / слоты
	- одна пища / одна из двух пища
	- вторая из двух пища


	- есть жир (только для 19)
	- приостановлено (пауза / стоп)
	- включен слот (один / два)
	- взята пища (одна / первая из двух)
	- взята пища (вторая из двух)
	*/
	constructor(creature, type, id = 0) {
		this.id = id;
		this.creature = creature;
		this.type = type;
		this.statusBox = null;

		this.currentFood = 0;
		this.feedMode = false;
	}

	static map() {
		let map = {};
		map[#evConst.PROPERTY_EXIST] = 'lexedo.games.Evolution.PropertyExist';
		map[#evConst.PROPERTY_BIG] = 'lexedo.games.Evolution.PropertyBig';
		map[#evConst.PROPERTY_FAST] = 'lexedo.games.Evolution.PropertyFast';
		map[#evConst.PROPERTY_INTERACT] = 'lexedo.games.Evolution.PropertyInteract';
		map[#evConst.PROPERTY_SWIM] = 'lexedo.games.Evolution.PropertySwim';
		map[#evConst.PROPERTY_HIDE] = 'lexedo.games.Evolution.PropertyHide';
		map[#evConst.PROPERTY_MIMICRY] = 'lexedo.games.Evolution.PropertyMimicry';
		map[#evConst.PROPERTY_HOLE] = 'lexedo.games.Evolution.PropertyHole';
		map[#evConst.PROPERTY_ACUTE] = 'lexedo.games.Evolution.PropertyAcute';
		map[#evConst.PROPERTY_DROP_TAIL] = 'lexedo.games.Evolution.PropertyDropTail';
		map[#evConst.PROPERTY_SCAVENGER] = 'lexedo.games.Evolution.PropertyScavenger';
		map[#evConst.PROPERTY_PARASITE] = 'lexedo.games.Evolution.PropertyParasite';
		map[#evConst.PROPERTY_PIRACY] = 'lexedo.games.Evolution.PropertyPiracy';
		map[#evConst.PROPERTY_SYMBIOSIS] = 'lexedo.games.Evolution.PropertySymbiosis';
		map[#evConst.PROPERTY_COOP] = 'lexedo.games.Evolution.PropertyCoop';
		map[#evConst.PROPERTY_HIBERNATE] = 'lexedo.games.Evolution.PropertyHibernate';
		map[#evConst.PROPERTY_TRAMP] = 'lexedo.games.Evolution.PropertyTramp';
		map[#evConst.PROPERTY_VENOM] = 'lexedo.games.Evolution.PropertyVenom';
		map[#evConst.PROPERTY_CARNIVAL] = 'lexedo.games.Evolution.PropertyCarnival';
		map[#evConst.PROPERTY_FAT] = 'lexedo.games.Evolution.PropertyFat';
		return map;
	}

	static create(creature, type, id) {
		let map = this.map();
		let className = map[type];
		if (!className) return null;
		return lx.createObject(className, [creature, id]);
	}

	getEnvironment() {
		return this.creature.getEnvironment();
	}

	getGame() {
		return this.creature.getEnvironment().game;
	}

	getGamer() {
		return this.creature.gamer;
	}

	getPicture() {
		var catalog = this.getEnvironment().dataCatalog;
		if (this.type == #evConst.PROPERTY_EXIST)
			return catalog.getCreaturePicrute();
		return catalog.getPropertyPictureUse(this.type);
	}

	setStatusBox(statusBox) {
		this.statusBox = statusBox;
	}

	onClick(event) {
		return false;
	}

	getNeedFood() {
		return 0;
	}

	getEatenFood() {
		return this.currentFood;
	}

	isFriendly() {
		return this.getEnvironment().dataCatalog.isPropertyFiendly(this.type);
	}

	isSingle() {
		return this.getEnvironment().dataCatalog.isPropertySingle(this.type);
	}

	setHighlighted(val) {
		this.statusBox.parent.toggleClassOnCondition(val, 'ev-highlight');
	}

	setFeedMode(bool) {
		if (this.getNeedFood() == 0 || this.feedMode == bool) return;

		if (bool) {
			if (this.getNeedFood() == 1)
				this.statusBox.picture('_hungry.png');
			else if (this.getNeedFood() == 2)
				this.statusBox.picture('_hungry2.png');
			this.statusBox.show();
			this.feedMode = true;
			this.currentFood = 0;
		} else {
			this.statusBox.hide();
			this.statusBox.clear();
			this.feedMode = false;
		}
	}

	feed(foodType) {
		if (!this.feedMode) {
			console.error('Try to feed property while it is\'n in feed mode');
			return;
		}

		var needFood = this.getNeedFood();
		var picture;
		if (foodType == #evConst.FOOD_TYPE_FAT) {
			picture = '_fat.png';
		} else {
			picture = (foodType == #evConst.FOOD_TYPE_RED) ? '_redFood' : '_blueFood';
			if (needFood == 2) picture += (this.currentFood) ? '21' : '22';
			picture += '.png';
		}

		this.statusBox.add(lx.Box, {geom: true, picture});
		this.currentFood++;
	}




}
