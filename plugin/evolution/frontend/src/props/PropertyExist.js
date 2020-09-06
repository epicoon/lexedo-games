#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyExist extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	constructor(creature) {
		super(creature, #evConst.PROPERTY_EXIST);
	}

	getNeedFood() {
		return 1;
	}

	onClick(event) {
		if (super.onClick() === false) return;

		let mode = this.getGame().mode;
		switch (true) {
			case mode.isMode(#evConst.MOUSE_MODE_NEW_PROPERTY):
				this.__onClickNewProperty(mode);
				break;

			case mode.isMode(#evConst.MOUSE_MODE_FEED):
				this.__onClickFeed(mode);
				break;

			case mode.isMode(#evConst.MOUSE_MODE_USE_PROPERTY):
				this.__onClickUseProperty(mode);
				break;
		}
	}

	setPoisoned() {
		this.statusBox.add(lx.Box, {
			geom: true,
			key: 'poison',
			picture: 'tools/poisoned.png'
		});
	}


	/*******************************************************************************************************************
	 * PRIVATE
	 ******************************************************************************************************************/

	__onClickNewProperty(mode) {
		if (!mode.data.checkDueGamer(this.getGamer())) {
			lx.Tost.error('Creature owner is wrong');
			return;			
		}
		if (!mode.data.checkDueCreature(this.creature)) {
			lx.Tost.error('Creature can not attach this property');
			return;
		}

		mode.data.setCreature(this.creature);

		if (mode.data.isReadyForTrigger()) {
			this.getEnvironment().triggerChannelEvent(
				'cart-to-property',
				mode.data.prepareEventData()
			);
			mode.reset();
		} else {
			mode.renewHighlight();
		}
	}

	__onClickFeed(mode) {
		mode.reset();
		this.getEnvironment().triggerChannelEvent('feed-creature', {
			gamer: this.getGame().getLocalGamer().getId(),
			creature: this.creature.id
		});
	}

	__onClickUseProperty(mode) {
		mode.data.property.processTarget(this);
	}
}
