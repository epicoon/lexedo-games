#lx:private;

#lx:macros evConst {lexedo.games.Evolution.Constants};

class Gamer extends lx.BindableModel #lx:namespace lexedo.games.Evolution {
	#lx:schema
		dropping: {default: 0},
		isPassed: {default: false},
		isActive: {default: false},
		canGetFood: {default: false};

	constructor(game, channelMate) {
		super();

		this._game = game;
		this._id = channelMate.getId();
		this._name = channelMate.name;
		this._isLocal = channelMate.isLocal();

		this._hand = new lx.Collection();
		if (this._isLocal) __setGui(this);

		this._creatures = new lx.Collection();
		__setBinds(this);
	}

	getEnvironment() {
		return this._game.getEnvironment();
	}

	getId() {
		return this._id;
	}

	getName() {
		return this._name;
	}

	isLocal() {
		return this._isLocal;
	}

	setActive(val) {
		this.isActive = val;
		if (!val)
			this.canGetFood = false;
		else {
			if (this._game.phaseIs(#evConst.PHASE_FEED) && this._game.phase.food)
				this.canGetFood = true;
			else
				this.canGetFood = false;
		}
	}

	getCreaturesCount() {
		return this._creatures.len;
	}

	receiveCarts(carts) {
		carts.each(cartData=>{
			let cart = new lexedo.games.Evolution.Cart(
				this.getEnvironment(),
				cartData[0],
				cartData[1],
				(cartData[2] !== undefined) ? cartData[2] : null
			);

			cart.setGamer(this);
			this._hand.add(cart);
		});
	}

	getCartById(id) {
		var selected = this._hand.select(item=>item.id==id);
		if (selected.isEmpty) return null;
		return selected.at(0);
	}

	getCreatures() {
		return this._creatures;
	}

	getCreatureById(id) {
		var selected = this._creatures.select(item=>item.id==id);
		if (selected.isEmpty) return null;
		return selected.at(0);
	}

	dropCart(cart) {
		this._hand.remove(cart);
	}

	cartToCreature(cart, creatureId) {
		this._hand.remove(cart);

		this._creatures.add(
			new lexedo.games.Evolution.Creature(this, creatureId)
		);
	}

	setCreaturesFeedMode(bool) {
		this._creatures.each(c=>c.setFeedMode(bool));
	}

	runExtinction(data) {
		// data - {dieOut:[creatureId], dropping:int}
		this.dropping += data.dropping;
		data.dieOut.each(creatureId=>this._creatures.remove(this.getCreatureById(creatureId)));
	}

	prepareToGrow() {
		this._creatures.each(creature=>creature.prepareToGrow());
	}
}


/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/
function __setGui(self) {
	__bindHand(self);
	__bindButtons(self);
}

// Привязываем карты на руке
function __bindHand(self) {
	var cartsBox = self.getEnvironment().getPlugin()->>cartsBox;
	cartsBox.matrix({
		items: self._hand,
		itemBox: lx.Box,
		itemRender: function(box, model) {
			box.width(box.height('px')*0.618+'px');

			box.__cart = model;
			box.__cart.setBox(box);
			box.onDestruct(function() {
				this.__cart.setBox(null);
				delete this.__cart;
			});
		}
	});

	cartsBox.on('resize', function() {
		this.getChildren().each(a=>a.width(a.height('px')*0.618+'px'));
	});
}

// Привязываем кнопки управления
function __bindButtons(self) {
	let plugin = self._game.getPlugin();

	plugin->>growPassBut.click(function() {
		self.getEnvironment().triggerChannelEvent('gamer-pass', {
			gamer: self.getId()
		});
	});
	plugin->>growPassBut.setField('isActive', function(val) {
		this.disabled(!val);
	});
	self.bind(plugin->>growPassBut);

	plugin->>feedEndTurnBut.click(function() {
		self.getEnvironment().triggerChannelEvent('gamer-end-turn', {
			gamer: self.getId()
		});		
	});
	plugin->>feedEndTurnBut.setField('isActive', function(val) {
		this.disabled(!val);
	});
	self.bind(plugin->>feedEndTurnBut);

	plugin->>foodBut.click(function(e) {
		self._game.mode.switchMode(#evConst.MOUSE_MODE_FEED, e);
	});
	plugin->>foodBut.setField('canGetFood', function(val) {
		this.disabled(!val);
	});
	self.bind(plugin->>foodBut);
}

// Привязываем управление существами и их свойствами
function __setBinds(self) {
	let plugin = self._game.getPlugin();
	let box = self.isLocal() ? plugin->>localCreaturesBox : plugin->>oppCreaturesBox;

	let h = Math.floor(plugin->>mainBox.height('px') / 8);
	let w = Math.round(h * 0.83);
	box.stream({indent:'10px', rowDefaultHeight:h+'px'});
	box.matrix({
		items: self._creatures,
		itemRender: function(box, creature) {
			let row = box.add(lx.Box, {geom:true});

			// Отследить состояние существа (активно, атаковано, отравлено, мертво)
			row.setField('state', function(state) {
				let creatureBox = this.child(0);
				if (state == 'base' && creatureBox.contains('state')) {
					creatureBox.del('state');
					return;
				}
				if (!creatureBox.contains('state'))
					creatureBox.add(lx.Box, {key:'state', geom:true, before:creatureBox->status});
				creatureBox->state.picture(creature.getPicture());
			});

			// Матрица свойств существ
			row.stream({direction:lx.HORIZONTAL, step:'5px', columnDefaultWidth:w+'px'});
			row.matrix({
				items: creature.getProperties(),
				itemRender: function(cell, property) {
					cell.picture(property.getPicture());
					let statusBox = cell.add(lx.Box, {key:'status', geom:true});
					statusBox.hide();
					property.setStatusBox(statusBox);
					cell.add(lx.Box, {geom:true, click:e=>property.onClick(e)});
				}
			});
		}
	});
}
