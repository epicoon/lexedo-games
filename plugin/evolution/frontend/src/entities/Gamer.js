#lx:private;

#lx:macros ev {lexedo.games.Evolution};
#lx:macros evConst {lexedo.games.Evolution.Constants};

class Gamer extends lexedo.games.Gamer #lx:namespace lexedo.games.Evolution {
	#lx:schema
		dropping: {default: 0},
		isPassed: {default: false},
		isActive: {default: false},
		canGetFood: {default: false};

	constructor(game, id, channelMate) {
		super(game, id, channelMate);

		this._colorIndex = 0;
		this.creatureHasUsedFat = null;

		this._hand = new lx.Collection();
		if (this._isLocal) __setGui(this);

		this._creatures = new lx.Collection();
		__initGui(this);
	}

	reset() {
		this._colorIndex = 0;
		this.dropping = 0;
		this.isPassed = false;
		this.isActive = false;
		this.canGetFood = false;
		this.creatureHasUsedFat = null;
		this._hand.clear();
		this._creatures.clear();
	}

	setActive(val) {
		this.isActive = val;
		if (!val)
			this.canGetFood = false;
		else {
			if (this._game.phaseIs(>>>evConst.PHASE_FEED) && this._game.phase.food) {
				this.canGetFood = true;
				this.creatureHasUsedFat = null;
				this.unpauseProperties();
			} else
				this.canGetFood = false;
		}
	}
	
	unpauseProperties() {
		this._creatures.forEach(creature=>creature.unpauseProperties());
	}

	mustEat() {
		return (this.canGetFood && this._game.phase.food && this.hasHungryCreature());
	}

	isAvailableToUseFat(creature) {
        return this.canGetFood && (this.creatureHasUsedFat === null || this.creatureHasUsedFat === creature);
	}

	hasHungryCreature() {
		var result = false;
		this._creatures.forEach(creature=>{
			if (creature.isHungry()) result = true;
		});
		return result;
	}

	getCreaturesCount() {
		return this._creatures.len;
	}

	receiveCarts(carts) {
		carts.forEach(cartData=>{
			let cart = new >>>ev.Cart(
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
		this.addCreature(creatureId);
	}

	addCreature(creatureId) {
		this._creatures.add(
			new >>>ev.Creature(this, creatureId)
		);
		return this._creatures.last();
	}

	setCreaturesFeedMode(bool) {
		this._creatures.forEach(c=>c.setFeedMode(bool));
	}

	dropCreature(data) {
		// data - {dropping:int, creatureId:int, ?relIds:[creatureId, propertyId]}
		this.dropping += data.dropping;
		this._creatures.remove(this.getCreatureById(data.creatureId));
		if (data.relProps) data.relProps.forEach(ids=>{
			let creature = this.getCreatureById(ids[0]);
			if (creature) creature.dropProperty(ids[1]);
		});
	}

	runExtinction(data) {
		// data - {creatures:[creatureId], properties:[creatureId, propertyId], dropping:int}
		this.dropping += data.dropping;
		data.creatures.forEach(creatureId=>this._creatures.remove(this.getCreatureById(creatureId)));
		data.properties.forEach(ids=>{
			let creature = this.getCreatureById(ids[0]);
			if (creature) creature.dropProperty(ids[1]);
		});
	}

	applyPropertiesState(data) {
		for (let id in data)
			this.getCreatureById(id).applyPropertiesState(data[id]);
	}

	prepareToGrow() {
		this._creatures.forEach(creature=>creature.prepareToGrow());
	}

	getColor() {
		var baseColors = [
			'LimeGreen',
			'red',
			'Orange',
			'DarkMagenta'
		];

		var baseColorIndex = this._colorIndex % 4;
		var baseColor = baseColors[baseColorIndex];
		var changeMode = Math.floor(this._colorIndex / 5);
		this._colorIndex++;
		switch (changeMode) {
			case 0: return new lx.Color(baseColor);
			case 1: return (new lx.Color(baseColor)).lighten(15);
			case 2: return (new lx.Color(baseColor)).lighten(30);
			case 3: return (new lx.Color(baseColor)).darken(15);
			case 4: return (new lx.Color(baseColor)).darken(30);
		}

		return new lx.Color('black');
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
			box.addClass('ev-cart');

			box.__cart = model;
			box.__cart.setBox(box);
			box.on('beforeDestruct', function() {
				this.__cart.setBox(null);
				delete this.__cart;
			});
		}
	});

	cartsBox.on('resize', function() {
		this.getChildren().forEach(a=>a.width(a.height('px')*0.618+'px'));
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
		if (self.mustEat()) {
			lx.Tost.error(#lx:i18n(tost.HaveToFeed));
			return;
		}

		self.getEnvironment().triggerChannelEvent('gamer-end-turn', {
			gamer: self.getId()
		});		
	});
	plugin->>feedEndTurnBut.setField('isActive', function(val) {
		this.disabled(!val);
	});
	self.bind(plugin->>feedEndTurnBut);

	plugin->>foodBut.click(function(e) {
		self._game.mode.switchMode(>>>evConst.MOUSE_MODE_FEED, e);
	});
	plugin->>foodBut.setField('canGetFood', function(val) {
		this.disabled(!val);
	});
	self.bind(plugin->>foodBut);
}

// Привязываем управление существами и их свойствами
function __initGui(self) {
	let plugin = self._game.getPlugin();
	let mainBox = plugin->>mainBox;

	let box;
	if (self.isLocal()) {
		let first = mainBox.child(0);
		box = first
			? new lx.Box({before: first})
			: mainBox.add(lx.Box);
	} else box = mainBox.add(lx.Box);
	box.overflow('auto');

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
					cell.addClass('ev-prop');

					let color = property.getColor();
					if (color) cell.border({
						width: 5,
						color: property.getColor()
					});
					if (property.isVirtual) {
						cell.opacity(0.5);
					} else {
						let statusBox = cell.add(lx.Box, {key:'status', geom:true});
						property.setStatusBox(statusBox);
						cell.add(lx.Box, {geom:true, click:e=>property.onClick(e)});
					}
				}
			});
		}
	});
}
