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
			case #evConst.MOUSE_MODE_NONE:
				this.box.hide();
				break;
			case #evConst.MOUSE_MODE_FEED:
				this.box.size('40px', '40px');
				this.box.picture('mouse/_food.png');
				self::__moveBox(this, e);
				this.box.show();
				break;

			case #evConst.MOUSE_MODE_NEW_PROPERTY:
				//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				this.box.size('40px', '40px');
				this.box.picture('mouse/_food.png');
				self::__moveBox(this, e);
				this.box.show();
				break;
		}
	}



	static __moveBox(self, e) {
		self.box.left(e.clientX + 10 + 'px');
		self.box.top(e.clientY - self.game.getPlugin().root.top('px') - 10 - self.box.height('px') + 'px');
		self.box.returnToParentScreen();
	}

	static __initGui(self) {
		self.getEnvironment().getPlugin().root.on('mousemove', (e)=>{
			if (self.game.mode.isMode(#evConst.MOUSE_MODE_NONE)) return;

			this.__moveBox(self, e);
		});




	}
}
