#lx:macros evConst {lexedo.games.Evolution.Constants};

class Mouse {
	constructor(game) {
		this.game = game;
		this.box = new lx.Box({geom:[0, 0, '40px', '40px']});
		this.box.hide();
		self::__initGui(this);
	}

	getEnvironment() {
		return this.game.getEnvironment();
	}

	setMode(mode, e) {
		switch (mode) {
			case >>>evConst.MOUSE_MODE_NONE:
				this.box.hide();
				return;

			case >>>evConst.MOUSE_MODE_FEED:
				this.__init('mouse/_food.png', '40px', '40px');
				break;
			case >>>evConst.MOUSE_MODE_NEW_PROPERTY:
				var pic = this.getEnvironment().dataCatalog.getPropertyPictureUse(
					this.game.mode.data.cart.getTitleProperty()
				);
				this.__init(pic, '37px', '60px');
				break;
			case >>>evConst.MOUSE_MODE_USE_PROPERTY:
				var pic = this.game.mode.data.property.getPicture();
				this.__init(pic, '37px', '60px');
				break;
		}

		self::__moveBox(this, e);
		this.box.show();
	}

	__init(pic, w, h) {
		this.box.size(w, h);
		this.box.picture(pic);
	}

	static __moveBox(self, e) {
		self.box.left(e.clientX + 10 + 'px');
		self.box.top(e.clientY - self.game.getPlugin().root.top('px') - 10 - self.box.height('px') + 'px');
		self.box.returnToParentScreen();
	}

	static __initGui(self) {
		self.getEnvironment().getPlugin().root.on('mousemove', (e)=>{
			if (self.game.mode.isMode(>>>evConst.MOUSE_MODE_NONE)) return;

			this.__moveBox(self, e);
		});




	}
}
