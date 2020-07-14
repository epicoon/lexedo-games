#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyExist #lx:namespace lexedo.games.Evolution extends lexedo.games.Evolution.Property {
	constructor(creature) {
		super(creature, #evConst.PROPERTY_EXIST);
	}

	needFood() {
		return 1;
	}

	onClick(event) {
		let mode = this.getGame().mode;
		if (mode.isMode(#evConst.MOUSE_MODE_NEW_PROPERTY)) {
			let cart = mode.data.cart;
			let isFriendly = this.getEnvironment().dataCatalog.isPropertyFiendly(cart.getTitleProperty());
			if (
				(isFriendly && !this.getGamer().isLocal())
				|| (!isFriendly && this.getGamer().isLocal())
			) return;

			mode.reset();
			this.getEnvironment().triggerChannelEvent('cart-to-property', {
				gamer: this.getGamer().getId(),
				cart: cart.id,
				creatureGamer: this.getGamer().getId(),
				creature: this.creature.id,
				property: cart.getTitleProperty()
			});
		}

		//!!!!
	}
}
