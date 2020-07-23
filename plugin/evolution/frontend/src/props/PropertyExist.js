#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyExist extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	constructor(creature) {
		super(creature, #evConst.PROPERTY_EXIST);
	}

	getNeedFood() {
		return 1;
	}

	onClick(event) {
		if (super.onClick()) return;

		let mode = this.getGame().mode;
		switch (true) {
			case mode.isMode(#evConst.MOUSE_MODE_NEW_PROPERTY):
				this.__onClickNewProperty(mode);
				break;

			case mode.isMode(#evConst.MOUSE_MODE_FEED):
				this.__onClickFeed(mode);
				break;
		}
	}


	/*******************************************************************************************************************
	 * PRIVATE
	 ******************************************************************************************************************/

	__onClickNewProperty(mode) {
		let cart = mode.data.cart;
		let isFriendly = cart.isPropertyFiendly();
		if (
			(isFriendly && !this.getGamer().isLocal())
			|| (!isFriendly && this.getGamer().isLocal())
		) {
			lx.Tost.error('Creature owner is wrong');
			return;
		}

		if (!this.creature.canAttachCart(cart)) {
			lx.Tost.error('Creature can not attach this property');
			return;
		}

		mode.reset();
		this.getEnvironment().triggerChannelEvent('cart-to-property', {
			gamer: cart.getGamer().getId(),
			cart: cart.id,
			creatureGamer: this.getGamer().getId(),
			creature: this.creature.id,
			property: cart.getTitleProperty()
		});
	}

	__onClickFeed(mode) {
		mode.reset();
		this.getEnvironment().triggerChannelEvent('feed-creature', {
			gamer: this.getGame().getLocalGamer().getId(),
			creature: this.creature.id
		});
	}
}
