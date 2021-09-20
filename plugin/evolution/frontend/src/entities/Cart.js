#lx:private;

#lx:macros evConst {lexedo.games.Evolution.Constants};

class Cart #lx:namespace lexedo.games.Evolution {
	constructor(env, id, prop1, prop2) {
		this._environment = env;
		this.id = id;
		this.prop1 = prop1;
		this.prop2 = prop2;
		this.gamer = null;
	}

	getEnvironment() {
		return this._environment;
	}

	getGame() {
		return this._environment.game;
	}

	setBox(box) {
		this.box = box;
		if (box === null) return;

		__setGui(this);
	}

	setGamer(gamer) {
		this.gamer = gamer;
	}

	getGamer() {
		return this.gamer;
	}

	switchProperties() {
		if (this.prop2 === null) return;

		var temp = this.prop1;
		this.prop1 = this.prop2;
		this.prop2 = temp;

		__setGui(this);
	}

	getTitleProperty() {
		return this.prop1;
	}

	isPropertyFiendly() {
		return this.getEnvironment().dataCatalog.isPropertyFiendly(this.getTitleProperty());
	}

	isPropertySingle() {
		return this.getEnvironment().dataCatalog.isPropertySingle(this.getTitleProperty());
	}

	isPropertyPare() {
		return this.getEnvironment().dataCatalog.isPropertyPare(this.getTitleProperty());
	}

	isPropertySymmetric() {
		return this.getEnvironment().dataCatalog.isPropertySymmetric(this.getTitleProperty());
	}

	useAsCreature() {
		this.getEnvironment().triggerChannelEvent('cart-to-creature', {
			gamer: this.gamer.getId(),
			cart: this.id
		});
	}

	useAsProperty(mouseEvent) {
		this.getGame().mode.switchMode(
			>>>evConst.MOUSE_MODE_NEW_PROPERTY,
			mouseEvent,
			new CartToPropertyData(this)
		);
	}
}


/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

class CartToPropertyData {
	constructor(cart) {
		this.cart = cart;
		this.step = -1;
		this.stepLog = [];
	}

	getEnvironment() {
		return this.cart.getEnvironment();
	}

	checkDueGamer(gamer) {
		let isFriendly = this.cart.isPropertyFiendly();
		return (isFriendly && gamer.isLocal())
			|| (!isFriendly && !gamer.isLocal());
	}

	checkDueCreature(creature) {
		if (this.cart.isPropertySingle()) {
			if (this.cart.getTitleProperty() == >>>evConst.PROPERTY_CARNIVAL) {
				if (creature.hasProperty(>>>evConst.PROPERTY_SCAVENGER))
					return false;
			} else if (this.cart.getTitleProperty() == >>>evConst.PROPERTY_SCAVENGER) {
				if (creature.hasProperty(>>>evConst.PROPERTY_CARNIVAL))
					return false;
			}

			var props = creature.getPropertiesByType(this.cart.getTitleProperty());
			return props.isEmpty;
		}

		if (this.step == -1) return true;

		if (this.step == 0 && creature == this.stepLog[0].creature)
			return false;

		var props = creature.getPropertiesByType(this.cart.getTitleProperty());
		var result = true;
		props.forEach(prop=>{
			if (prop.getRelatedCreature() == this.stepLog[0].creature)
				result = false;
		});
		return result;
	}

	setCreature(creature) {
		creature.addVirtualProperty(this.cart.getTitleProperty());
		this.stepLog.push({creature});
		this.step++;
	}

	reset() {
		this.stepLog.forEach(record=>record.creature.dropVirtualProperties());
	}

	isReadyForTrigger() {
		if (!this.cart.isPropertyPare())
			return true;

		return this.step == 1;
	}

	prepareEventData() {
		var cart = this.cart;
		var creatures = [];
		this.stepLog.forEach(record=>{
			creatures.push({
				creatureGamer: record.creature.getGamer().getId(),
				creature: record.creature.id,
			});
		});

		return {
			gamer: cart.getGamer().getId(),
			cart: cart.id,
			property: cart.getTitleProperty(),
			creatures
		};
	}
}

function __setGui(self) {
	if (!self.box.__inited) __initBox(self);

	if (self.box.contains('prop1')) {
		self.box.del('prop1');
	}
	if (self.box.contains('prop2')) {
		self.box.del('prop2');
		self.box.del('bottomClicker');
	}

	let pic1 = self.getEnvironment().dataCatalog.getPropertyPictureMax(self.prop1);
	let propBox1 = self.box.add(lx.Box, {
		key: 'prop1',
		geom: true,
	});
	propBox1.picture(pic1);

	if (self.prop2 === null) return;

	let pic2 = self.getEnvironment().dataCatalog.getPropertyPictureMin(self.prop2);
	let propBox2 = self.box.add(lx.Box, {
		key: 'prop2',
		geom: true,
	});
	propBox2.picture(pic2);

	self.box.add(lx.Box, {
		key: 'bottomClicker',
		geom: [0, 79, 100, 21],
		style: {cursor: 'pointer'},
		click: function() {
			this.parent.__cart.switchProperties();
		}
	});
}

function __initBox(self) {
	let plugin = self.getEnvironment().getPlugin();

	self.box.on('mouseover', function() {
		if (!self.getEnvironment().game.getLocalGamer().isActive) return;

		let cartMenu = plugin->>cartMenu;

		let rect = this.getRectInPlugin();
		cartMenu.left(rect.left - 5 + 'px');
		cartMenu.top(rect.top - 110 + 'px');
		cartMenu.width(rect.width + 10 + 'px');
		cartMenu.height(rect.height + 115 + 'px');
		cartMenu.show();

		let creaturesCount = self.getEnvironment().game.getLocalGamer().getCreaturesCount();
		let disable = (
			(creaturesCount == 0)
			|| (self.isPropertyPare() && creaturesCount < 2)
		);
		cartMenu->newPropertyBut.disabled(disable);

		self.box.style('zIndex', 100);
		cartMenu.__cart = self;
	});

	self.box.__inited = true;	
}
