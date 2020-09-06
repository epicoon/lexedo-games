#lx:macros evConst {lexedo.games.Evolution.Constants};

class GamePhase extends lx.BindableModel {
	#lx:schema type, name, gamer, hint, food;

	constructor(game) {
		super();
		this.game = game;
	}

	reset() {
		this.set(#evConst.PHASE_NONE);
		this.food = 0;
	}

	set(type) {
		this.type = type;
		this.actualize();
	}	

	setData(data) {
		if (this.isFeed()) {
			this.food = data.foodCount;
		}
	}

	actualize(gamer = null) {
		if (gamer) this.gamer = gamer;
		if (this.type == #evConst.PHASE_GROW) {
			this.name = 'Фаза развития';
			if (this.gamer.isLocal())
				this.hint = 'Используйте карту';
			else
				this.hint = 'Ожидание действий оппонента...';
		} else if (this.type == #evConst.PHASE_FEED) {
			this.name = 'Фаза питания';
			if (this.gamer.isLocal())
				this.hint = 'Берите фишки еды, и/или используйте свойства';
			else
				this.hint = 'Ожидание действий оппонента...';
		}
	}

	isGrow() {
		return this.type == #evConst.PHASE_GROW;
	}

	isFeed() {
		return this.type == #evConst.PHASE_FEED;
	}



}
