class EventListener extends lexedo.games.ChannelEventListener #lx:namespace lexedo.games.Evolution {
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
		var gamer = this.getEnvironment().game.getGamerById(event.getData().gamer);
		var cart  = gamer.getCartById(event.getData().cart);
		var creatureOwner = this.getEnvironment().game.getGamerById(event.getData().creatureGamer);
		var creature = creatureOwner.getCreatureById(event.getData().creature);
		var propertyType = event.getData().property;
		var propertyId = event.getData().propertyId;

		gamer.dropCart(cart);
		creature.addProperty(propertyType, propertyId);
	}

	onFeedCreature(event) {
		var data = event.getData();

		this.getEnvironment().game.phase.food = data.currentFood;

		var gamer = this.getEnvironment().game.getGamerById(data.gamer);
		data.feedReport.each(creatureData=>{
			var creature = gamer.getCreatureById(creatureData.creatureId);
			creature.feed(creatureData.propertyId, creatureData.foodType);
		});
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
		this.getEnvironment().game.setFeedPhase(event.getData());
	}
}
