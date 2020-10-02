#lx:macros evConst {lexedo.games.Evolution.Constants};

class PropertyPiracy extends lexedo.games.Evolution.Property #lx:namespace lexedo.games.Evolution {
	onClick(event) {
		if (super.onClick() === false) return;
		if (!this.getGame().phaseIs(#evConst.PHASE_FEED)) return;
		if (!this.getGamer().isLocal()) return;

		var targets = this.getTargets();
		if (!targets.len) {
			lx.Tost(#lx:i18n(tost.noTargets));
			return;
		}

		this.getGame().mode.switchMode(#evConst.MOUSE_MODE_USE_PROPERTY, event, {
			property: this
		});
	}

	onActionProcess(data) {
		this.getGame().mode.reset();

		var targetGamer = this.getGame().getGamerById(data.targetGamer);
		var targetCreature = targetGamer.getCreatureById(data.targetCreature);
		var targetProperty = targetCreature.getPropertyById(data.targetProperty);

		targetProperty.loseFood();
		this.getGame().applyFeedReport(data.feedReport);
	}

	/**
	 * @param {lexedo.games.Evolution.PropertyExist} target
	 */
	processTarget(target) {
		if (!this.checkTarget(target)) return;

		this.triggerPropertyAction({
			targetGamer: target.getGamer().getId(),
			targetCreature: target.getCreature().getId()
		});
	}

	/**
	 * @return lexedo.games.Evolution.Property[]
	 */
	getTargets() {
		var result = [];
		this.getGame().eachGamer(gamer=>{
			gamer.getCreatures().each(creature=>{
				if (creature == this.getCreature()) return;
				if (creature.getEatenFood() > 0 && creature.isUnderfed())
					result.push(creature.getExistProperty());
			});
		});
		return result;
	}
}
