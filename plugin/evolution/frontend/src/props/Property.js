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

		this.isHungry = false;
	}

	static create(creature, type, id) {
		switch (type) {
			case #evConst.PROPERTY_EXIST:
				return new lexedo.games.Evolution.PropertyExist(creature);

			case #evConst.PROPERTY_CARNIVAL:
				return new lexedo.games.Evolution.PropertyCarnival(creature, id);
		}
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
		// abstract
	}

	needFood() {
		return 0;
	}

	setHungry(bool) {
		if (this.needFood() == 0 || this.isHungry == bool) return;

		if (bool) {
			if (this.needFood() == 1)
				this.statusBox.picture('_hungry.png');
			else if (this.needFood() == 2)
				this.statusBox.picture('_hungry2.png');
			this.statusBox.show();
			this.isHungry = true;
		} else {
			this.statusBox.hide();
			this.statusBox.clear();
			this.isHungry = false;
		}
	}




}
