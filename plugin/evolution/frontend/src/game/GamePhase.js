#lx:macros evConst {lexedo.games.Evolution.Constants};

class GamePhase extends lx.BindableModel {
	#lx:schema type, name, gamer, hint, food;

	constructor(game) {
		super();
		this.game = game;
	}

	reset() {
		this.set(>>>evConst.PHASE_NONE);
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
		if (this.type == >>>evConst.PHASE_GROW) {
			this.name = #lx:i18n(phaseName.Growing);
			if (this.gamer.isLocal())
				this.hint = #lx:i18n(phaseHint.UseCart);
			else
				this.hint = #lx:i18n(phaseHint.Waiting);
		} else if (this.type == >>>evConst.PHASE_FEED) {
			this.name = #lx:i18n(phaseName.Feeding);
			if (this.gamer.isLocal())
				this.hint = #lx:i18n(phaseHint.UseProperties);
			else
				this.hint = #lx:i18n(phaseHint.Waiting);
		}
	}

	isGrow() {
		return this.type == >>>evConst.PHASE_GROW;
	}

	isFeed() {
		return this.type == >>>evConst.PHASE_FEED;
	}
}
