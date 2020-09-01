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
		var data = event.getData();
		var gamer = this.getEnvironment().game.getGamerById(data.gamer);
		var cart  = gamer.getCartById(data.cart);
		var propertyType = data.property;
		var propertyIds = data.propertyIds;

		gamer.dropCart(cart);
		var color = null;
		var newProperties = [];
		data.creatures.each((creatureData, asymm)=>{
			let creatureOwner = this.getEnvironment().game.getGamerById(creatureData.creatureGamer);
			if (data.creatures.len == 2 && color === null)
				color = creatureOwner.getColor();
			let config = {
				type: propertyType,
				id: propertyIds[asymm],
				asymm
			};
			if (color) config.color = color;
			let creature = creatureOwner.getCreatureById(creatureData.creature);
			newProperties.push(creature.addProperty(config));
		});

		if (newProperties.len == 2) {
			newProperties[0].setRelation(newProperties[1]);
			newProperties[1].setRelation(newProperties[0]);
		}
	}

	onFeedCreature(event) {
		var data = event.getData();

		this.getEnvironment().game.phase.food = data.currentFood;

		var gamer = this.getEnvironment().game.getGamerById(data.gamer);
		gamer.feedCreatures(data.feedReport);
		gamer.canGetFood = false;
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
		this.getEnvironment().game.resetPhase(event.getData());
	}

	onPropertyAction(event) {
		var data = event.getData();
		var game = this.getEnvironment().game;

		var gamer = game.getGamerById(data.gamer);
		var creature = gamer.getCreatureById(data.creature);
		var property = creature.getPropertyById(data.property);
		property.onAction(data.result);
	}

	onFinishFeedPhase(event) {
		var data = event.getData();
		var game = this.getEnvironment().game;

		game.runExtinction(data.extinction);
		game.applyPropertiesState(data.properties);

		if (data.gameOver) {
			game.showResult(data.results);
		} else {
			game.isLastTurn = data.isLastTurn;

			game.prepareToGrow();
			game.getLocalGamer().receiveCarts(data.carts);
			game.resetPhase(data);
		}
	}

	onApproveRevenge(event) {
		let report = event.getData().report;
		this.getEnvironment().triggerEvent('revengeApproved', [report, event.isFromMe()]);
	}

	onGamerLeave(event) {
		console.log('!!!!!!!!!!!!!! onGamerLeave');
		console.log(event);

		//TODO
	}
}
