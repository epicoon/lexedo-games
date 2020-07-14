class EventListener #lx:namespace lexedo.games.Evolution extends lexedo.games.ChannelEventListener {
	onChatMessage(event) {
		this.getEnvironment().game.chat.receive(event);
	}

	onCartToCreature(event) {
		var gamer = this.getEnvironment().game.getGamerById(event.getData().gamer);
		var cart  = gamer.getCartById(event.getData().cart);
		var creatureId = event.getData().creatureId;

		gamer.cartToCreature(cart, creatureId);
	}

	onCartToProperty(event) {
		var gamer = this.getEnvironment().game.getGamerById(event.getData().creatureGamer);
		var cart  = gamer.getCartById(event.getData().cart);
		var creature = gamer.getCreatureById(event.getData().creature);
		var propertyType = event.getData().property;
		var propertyId = event.getData().propertyId;

		gamer.dropCart(cart);
		creature.addProperty(propertyType, propertyId);
	}

	onChangeActiveGamer(event) {
		this.getEnvironment().game.changeActiveGamer(
			event.getData().old,
			event.getData().new
		);
	}

	onGamerPass(event) {
		var gamer = this.getEnvironment().game.getGamerById(event.getData().gamer);
		gamer.isPassed = true;
	}

	onStartFeedPhase(event) {
		this.getEnvironment().game.setPhase(event.getData());
	}
}
