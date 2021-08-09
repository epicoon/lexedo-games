class EventListener extends lexedo.games.ChannelEventListener #lx:namespace lexedo.games.Evolution {
	onError(event) {
		lx.Tost.error(event.getData().message);
		this.getEnvironment().game.mode.reset();
	}

	onLog(event) {
		this.getEnvironment().game.log(event.getData().log);
	}

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

		gamer.dropCart(cart);
		var color = null;
		var newProperties = [];
		data.creatures.each((creatureData)=>{
			let creatureOwner = this.getEnvironment().game.getGamerById(creatureData.creatureGamer);
			if (data.creatures.len == 2 && color === null)
				color = creatureOwner.getColor();
			let config = {
				type: propertyType,
				id: creatureData.property
			};
			if (creatureData.asymm) config.asymm = creatureData.asymm;
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
		this.getEnvironment().game.applyFeedReport(data.feedReport);
		gamer.canGetFood = false;
	}

	onChangeActiveGamer(event) {
		this.getEnvironment().game.changeActiveGamer(event.getData().new);
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
		this.getEnvironment().game.onRevengeApproved(report, event.isFromMe());
	}

	onGamerLeave(event) {
		console.log('!!!!!!!!!!!!!! onGamerLeave');
		console.log(event);

		//TODO
	}
}
