#lx:private;

#lx:macros evConst {lexedo.games.Evolution.Constants};

class Game #lx:namespace lexedo.games.Evolution extends lexedo.games.Game {
	init() {
		this.gamers = {};
		this.turnSequence = [];
		this.gamersBySequence = new lx.Collection();

		this.phase = new GamePhase(this);
		this.chat = new GameChat(this);
		this.logger = new GameLogger(this);
		this.mouse = new Mouse(this);
		this.mode = new MouseMode(this);

		__setGui(this);

		// this.getPlugin()
		// this.getEnvironment()
		// this.isPending()
	}

	registerGamer(channelMate) {
		let gamer = new lexedo.games.Evolution.Gamer(this, channelMate);
		this.gamers[gamer.getId()] = gamer;
	}

	getGamers() {
		return this.gamers;
	}

	eachGamer(f) {
		for (let id in this.gamers)
			f(this.gamers[id]);
	}

	getLocalGamer() {
		return this.getGamerById(this.getEnvironment().getSocket().getLocalMate().getId());
	}

	getActiveGamer() {
		return this.phase.gamer;
	}

	getGamerById(id) {
		return this.gamers[id];
	}

	log(text) {
		this.logger.print(text);
	}

	onBegin(data) {
		this.getLocalGamer().receiveCarts(data.carts);
		this.resetTurnSequence(data.activePhase, data.turnSequence);
		this.gamersBySequence.at(0).setActive(true);
	}

	setPhase(data) {
		this.eachGamer(g=>{
			g.setActive(false);
			g.isPassed = false;
			g.setCreaturesHungry(true);
		});
		this.resetTurnSequence(data.activePhase, data.turnSequence);
		this.phase.setData(data);
		this.gamersBySequence.at(0).setActive(true);
	}

	phaseIs(type) {
		return this.phase.type == type;
	}

	resetTurnSequence(phase, turnSequence) {
		this.turnSequence = turnSequence;
		this.gamersBySequence.clear();
		this.turnSequence.each(id=>this.gamersBySequence.add(this.getGamerById(id)));
		this.phase.gamer = this.gamersBySequence.at(0);
		this.phase.set(phase);
	}

	changeActiveGamer(oldId, newId) {
		var oldGamer = this.getGamerById(oldId);
		var newGamer = this.getGamerById(newId);
		var currentGamer = this.getActiveGamer();

		if (currentGamer != oldGamer) {
			//TODO логировать?
			console.error('Active gamer mismatch');
		}

		currentGamer.setActive(false);
		newGamer.setActive(true);
		this.phase.gamer = newGamer;
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
			? 'Ваш ход'
			: 'Ходит игрок ' + gamer.getName();
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
		this.text('Пища: ' + val);
	});
	self.phase.bind(plugin->>phaseInfoBox);

	// Управление картами
	let cartMenu = Plugin->>cartMenu;
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
	Snippet.widget.on('mousemove', function(e) {
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
}
