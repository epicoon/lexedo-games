#lx:macros evConst {lexedo.games.Evolution.Constants};

class GamePhase extends lx.BindableModel {
	#lx:schema type, name, gamer, hint, food;

	constructor(game) {
		super();
		this.game = game;
	}

	set(type) {
		this.type = type;
		if (type == #evConst.PHASE_GROW) {
			this.name = 'Фаза развития';
			if (this.gamer.isLocal())
				this.hint = 'Используйте карту';
			else
				this.hint = 'Ожидание действий оппонента...';
		} else if (type == #evConst.PHASE_FEED) {
			this.name = 'Фаза питания';
			if (this.gamer.isLocal())
				this.hint = 'Берите фишки еды, и/или используйте свойства';
			else
				this.hint = 'Ожидание действий оппонента...';
		}
	}

	setData(data) {
		if (this.type == #evConst.PHASE_FEED) {
			this.food = data.foodCount;
		}
	}

	isGrow() {
		return this.type == #evConst.PHASE_GROW;
	}

	isFeed() {
		return this.type == #evConst.PHASE_FEED;
	}



}
