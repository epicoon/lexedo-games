#lx:macros evConst {lexedo.games.Evolution.Constants};

class MouseMode {
	constructor(game) {
		this.game = game;
		this.mode = #evConst.MOUSE_MODE_NONE;
		this.highlightedProps = [];
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
		this.__highlightProps();
	}

	isMode(mode) {
		return this.mode == mode;
	}


	/*******************************************************************************************************************
	 * PRIVATE
	 ******************************************************************************************************************/

	__highlightProps() {
		this.highlightedProps.each(prop=>prop.setHighlighted(false));
		this.highlightedProps = this.__getPropsForHightlight();
		this.highlightedProps.each(prop=>prop.setHighlighted(true));
	}

	__getPropsForHightlight() {
		switch (this.mode) {
			case #evConst.MOUSE_MODE_NONE:
				return [];
			case #evConst.MOUSE_MODE_NEW_PROPERTY:
				return this.__getHPNew();
			case #evConst.MOUSE_MODE_FEED:
				return this.__getHPFeed();
		}
	}

	__getHPNew() {
		var cart = this.data.cart;
		var gamers = [];
		if (cart.isPropertyFiendly()) {
			gamers.push(cart.getGamer());
		} else {
			this.game.eachGamer(gamer=>{
				if (gamer != cart.getGamer())
					gamers.push(gamer);
			});
		}

		var props = [];
		gamers.each(gamer=>{
			gamer.getCreatures().each(creature=>{
				if (creature.canAttachCart(cart))
					props.push(creature.getExistProperty());
			});
		});
		return props;
	}

	__getHPFeed() {
		var gamer = this.game.getLocalGamer();

		var props = [];
		gamer.getCreatures().each(creature=>{
			if (creature.canEat())
				props.push(creature.getExistProperty());
		});
		return props;
	}
}
