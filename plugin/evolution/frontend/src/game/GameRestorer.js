class GameRestorer #lx:namespace lexedo.games.Evolution {
	constructor(game, condition) {
		this.game = game;
		this.condition = condition;

		console.log('!!!!! GameRestorer !!!!!!!')
		console.log(condition);
	}

	run() {
		//TODO compare conditions
		this.game.reset();

		var game = this.game,
			condition = this.condition,
			localGamer = game.getLocalGamer(),
			gamerData = condition.gamers[localGamer.getId()];
		localGamer.receiveCarts(gamerData.carts);

		// Creatures
		var creaturesMap = {};
		for (let creatureData of condition.creatures) {
			let gamer = game.getGamerById(creatureData.gamerId);
			let creature = gamer.addCreature(creatureData.creatureId);
			creaturesMap[creatureData.creatureId] = creature;
		}

		// Properties
		var propertiesMap = {};
		for (let propertyData of condition.properties) {
			let creature = creaturesMap[propertyData.creatureId];

			let config = {
				id: propertyData.propertyId,
				type: propertyData.type,
				asymm: propertyData.asymm
			};
			let relProperty = null;
			if (propertyData.relProperty !== null) {
				if (propertyData.relProperty in propertiesMap) {
					relProperty = propertiesMap[propertyData.relProperty];
					config.color = relProperty.color;
				} else {
					config.color = creature.getGamer().getColor();
				}
			}

			let property = creature.addProperty(config);
			propertiesMap[property.getId()] = property;
			if (relProperty) {
				property.setRelation(relProperty);
				relProperty.setRelation(property);
			}
		}

		game.resetPhase(condition);
		game.changeActiveGamer(condition.activeGamer);

		// Gamer statuses
		for (let id in condition.gamers) {
			let gamerData = condition.gamers[id],
				gamer = game.getGamerById(id);
			gamer.isPassed = gamerData.isPassed;
			gamer.canGetFood = gamerData.canGetFood;
		}

		// Creature statuses
		for (let creatureData of condition.creatures) {
			let creature = creaturesMap[creatureData.creatureId];
			if (creatureData.isPoisoned) creature.poison();
			for (let foodType of creatureData.currentFood)
				creature.feed(0, foodType);
		}

		// Property statuses
		for (let propertyData of condition.properties) {
			let property = propertiesMap[propertyData.propertyId];
			for (let foodType of propertyData.currentFood)
				property.feed(foodType);
			property.actualizeState(propertyData);
		}

		// Attak status
		if (condition.attakState.onHold)
			game.getEnvironment().attakCore.holdAttak(condition.attakState);
	}
}
