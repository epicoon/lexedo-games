#lx:macros evConst {lexedo.games.Evolution.Constants};

class MouseMode {
	constructor(game) {
		this.game = game;
		this.mode = #evConst.MOUSE_MODE_NONE;
		this.highlighted = [];
		this.data = {};
	}

	reset() {
		this.setMode(#evConst.MOUSE_MODE_NONE);
	}

	switchMode(mode, e, data = {}) {
		if (this.mode == mode)
			this.setMode(#evConst.MOUSE_MODE_NONE);
		else
			this.setMode(mode, e, data);
	}

	setMode(mode, e, data = {}) {
		this.mode = mode;
		this.data = data;

		this.game.mouse.setMode(mode, e);

		switch (mode) {
			case #evConst.MOUSE_MODE_NONE:
				this.highlighted.each(elem=>elem.removeClass('ev-highlight'));
				this.highlighted = [];
				this.data = {};
				break;
			case #evConst.MOUSE_MODE_FEED:
				var gamer = this.game.getActiveGamer();

				break;
			case #evConst.MOUSE_MODE_NEW_PROPERTY:
				var gamer = this.game.getActiveGamer();

				console.log('MOUSE_MODE_NEW_PROPERTY!!!!!!!!!!');

				break;
		}
	}

	isMode(mode) {
		return this.mode == mode;
	}

}
