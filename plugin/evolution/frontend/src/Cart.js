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

	useAsCreature() {
		this.getEnvironment().triggerChannelEvent('cart-to-creature', {
			gamer: this.gamer.getId(),
			cart: this.id
		});
	}

	useAsProperty(e) {
		this.getGame().mode.switchMode(#evConst.MOUSE_MODE_NEW_PROPERTY, e, {cart: this});
	}
}


/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

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

		cartMenu->newPropertyBut.disabled(
			self.getEnvironment().game.getLocalGamer().getCreaturesCount() == 0
		);

		self.box.style('zIndex', 100);
		cartMenu.__cart = self;
	});

	self.box.__inited = true;	
}
