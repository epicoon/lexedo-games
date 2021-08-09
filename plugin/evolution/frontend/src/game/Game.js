#lx:private;

#lx:macros ev {lexedo.games.Evolution};
#lx:macros evConst {lexedo.games.Evolution.Constants};

/**
 * @property {Object} gamers
 * @method getPlugin()
 * @method getEnvironment()
 * @method isPending()
 */
class Game extends lexedo.games.Game #lx:namespace lexedo.games.Evolution {
	getGamerClass() {
		return lexedo.games.Evolution.Gamer;
	}

	init() {
		this.turnSequence = [];
		this.gamersBySequence = new lx.Collection();
		this.isLastTurn = false;

		this.phase = new GamePhase(this);
		this.chat = new GameChat(this);
		this.logger = new GameLogger(this);
		this.mouse = new Mouse(this);
		this.mode = new MouseMode(this);

		this.getEnvironment().attakCore = new #ev.AttakCore(this);

		__setGui(this);
	}

	log(text) {
		lx.Tost(text);
		this.logger.print(text);
	}

	actualizeAfterReconnect(data) {
		if (data.type == #evConst.RECONNECTION_STATUS_PENDING) {
			return;
		}

		// Revange refreshing
		if (data.type == #evConst.RECONNECTION_STATUS_REVANGE) {
			var params = {
				approvesCount: data.approvesCount,
				gamersCount: data.gamersCount
			};
			this.showResult();
			this.onRevengeApproved(params, data.revengeApprovements.contains(this.getLocalGamer().getId()));
			return;
		}

		let restorer = new #ev.GameRestorer(this, data.condition);
		restorer.run();
	}

	onBegin(data) {
		this.reset();
		this.getLocalGamer().receiveCarts(data.carts);
		this.resetPhase(data);
	}

	onRevengeApproved(data, isFromMe) {
		var resultBox = this.getPlugin()->>resultBox;
		if (data.start) resultBox.hide();
		else resultBox.refresh(data.approvesCount, data.gamersCount, isFromMe);		
	}

	getActiveGamer() {
		return this.phase.gamer;
	}

	reset() {
		this.turnSequence = [];
		this.gamersBySequence.clear();
		this.isLastTurn = false;

		this.phase.reset();
		this.logger.reset();
		this.mode.reset();
		this.eachGamer(gamer=>gamer.reset());
	}

	resetPhase(data) {
		this.setTurnSequence(data.turnSequence);
		this.phase.gamer = this.gamersBySequence.at(0);
		this.phase.set(data.activePhase);
		this.phase.setData(data);
		this.eachGamer(g=>{
			g.unpauseProperties();
			g.setActive(false);
			g.isPassed = false;
			g.setCreaturesFeedMode(this.phase.isFeed());
		});
		this.gamersBySequence.at(0).setActive(true);
	}

	setTurnSequence(turnSequence) {
		this.turnSequence = turnSequence;
		this.gamersBySequence.clear();
		this.turnSequence.each(id=>this.gamersBySequence.add(this.getGamerById(id)));
	}

	phaseIs(type) {
		return this.phase.type == type;
	}

	changeActiveGamer(newId) {
		var newGamer = this.getGamerById(newId);
		var currentGamer = this.getActiveGamer();

		currentGamer.setActive(false);
		newGamer.setActive(true);
		this.phase.actualize(newGamer);
	}

	applyFeedReport(feedReport) {
		feedReport.each(data=>{
			let gamer = this.getGamerById(data.gamerId);
			let creature = gamer.getCreatureById(data.creatureId);
			creature.feed(data.propertyId, data.foodType);
			if (data.pareState) {
				data.pareState.each(pareData=>{
					creature.getPropertyById(pareData.propertyId)
						.actualizeState(pareData.state);
					gamer.getCreatureById(pareData.relCreatureId)
						.getPropertyById(pareData.relPropertyId)
						.actualizeState(pareData.relState);
				});
			}
		});		
	}

	runExtinction(data) {
		// data[gamerId] = {creatures:[creatureId], properties:[creatureId, propertyId], dropping:int}
		for (let gamerId in data) {
			let gamer = this.getGamerById(gamerId);
			gamer.runExtinction(data[gamerId]);
		}
	}

	applyPropertiesState(data) {
		for (let gamerId in data)
			this.getGamerById(gamerId).applyPropertiesState(data[gamerId]);
	}

	prepareToGrow() {
		this.eachGamer(gamer=>gamer.prepareToGrow());
	}

	showResult(result) {
		let plugin = this.getPlugin();
		let resultMatrix = plugin->>resultMatrix;
		resultMatrix.showResult(result);
	}
}


/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

function __setGui(self) {
	let plugin = self.getPlugin();

	// Список игроков
	plugin->>gamersBox.matrix({
		items: self.gamersBySequence,
		itemRender: function(box, model) {
			let nameWrapper = new lx.Box({geom:true});
			nameWrapper.text(model.getName());
			nameWrapper.align(lx.LEFT, lx.MIDDLE);

			let state = new lx.Box({geom:[null, 0, '40px', '40px', 0]});
			state.setField('isPassed', function(val) {
				this.picture(val ? 'tools/check.png' : '');
			});

			box.setField('isActive', function(val) {
				this.fill(val ? 'lightgreen' : '');
			});
		}
	});

	// Внутриигровой чат
	plugin->>chatMessageBox.on('blur', function() {
		let msg = this.value();
		if (msg == '') return;

		this.value('');
		self.chat.send(msg);
	});
	plugin->>chatBox.matrix({
		items: self.chat.messages,
		itemRender: function(box, model) {
			let text = model.from.getName() + ': ' + model.text;
			box.text(text);
		}
	});

	// Логгер игровых событий
	plugin->>logBox.matrix({
		items: self.logger.messages,
		itemRender: function(box, model) {
			box.text(model.text);
			if (self.logger.getCount() % 2) box.fill('#EEEEEE');
		}
	});

	// Информация по текущей фазе игры
	plugin->>phaseType.setField('name', function(val) {
		if (!val) return;
		this.text(val);
	});
	plugin->>phaseCurrentGamer.setField('gamer', function(gamer) {
		if (!gamer) return;

		var text = gamer.isLocal()
			? #lx:i18n(yourTurn)
			: #lx:i18n(opponentTurn, {name: gamer.getName()});
		this.text(text);
	});
	plugin->>phaseHint.setField('hint', function(val) {
		if (!val) return;
		this.text(val);
	});
	plugin->>phaseMenu.setField('type', function(val) {
		if (!val) return;

		plugin->>phaseMenu.getChildren().each(child=>child.hide());
		if (val == #evConst.PHASE_GROW) {
			plugin->>phaseGrowMenu.show();
		} else if (val == #evConst.PHASE_FEED) {
			plugin->>phaseFeedMenu.show();
		}
	});
	plugin->>foodInfoBox.setField('food', function(val) {
		this.text(#lx:i18n(food) + ': ' + val);
	});
	self.phase.bind(plugin->>phaseInfoBox);

	// Управление картами
	let cartMenu = plugin->>cartMenu;
	cartMenu.close = function() {
		this.__cart.box.style('zIndex', null);
		this.__cart = null;
		this.hide();
	};
	cartMenu->newCreatureBut.click(function() {
		let cart = cartMenu.__cart;
		cartMenu.close();
		cart.useAsCreature();
	});
	cartMenu->newPropertyBut.click(function(e) {
		let cart = cartMenu.__cart;
		cartMenu.close();
		cart.useAsProperty(e);
	});
	plugin.root.on('mousemove', function(e) {
		if (cartMenu.visibility()) {
			if (e.target && e.target.__lx && (
				e.target.__lx == cartMenu
				|| e.target.__lx.hasAncestor(cartMenu)
				|| e.target.__lx == cartMenu.__cart.box
				|| e.target.__lx.hasAncestor(cartMenu.__cart.box)
			)) return;
			cartMenu.close();
		}
	});

	// Результаты игры
	plugin->>resultMatrix.env = self.getEnvironment();
}
