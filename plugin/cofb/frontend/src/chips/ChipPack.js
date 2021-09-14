class ChipPack #lx:namespace lexedo.games.Cofb {
	constructor(packs, side, back, unlimit) {
		this.packs = packs;
		this.side = side;
		this.back = back;

		this.unlimit = unlimit;
		this.cart = [];
		this.sequence = [];
		this.inGame = 0;
	}

	addChipInfo(groupe, variant) {
		var chipInfo = new lexedo.games.Cofb.ChipInfo(groupe, variant, this);
		this.cart.push( chipInfo );
		return chipInfo;
	}

	shuffle() {
		if (this.unlimit) return;

		this.sequence = [];
		for (var i=0; i<this.cart.length; i++) this.sequence.push(i);
		for (var i = this.sequence.length - 1; i > 0; i--) {
			var num = Math.floor(Math.random() * (i + 1));
			var d = this.sequence[num];
			this.sequence[num] = this.sequence[i];
			this.sequence[i] = d;
		}
		return this;
	}

	getOne() {
		if (this.unlimit) return this.cart[0];

		var num = this.inGame;
		this.inGame++;
		if ( this.sequence.length ) return this.cart[ this.sequence[num] ];

		return this.cart[num];
	}

	clear() {
		for (var i in this.cart) {
			var cart = this.cart[i];
			if ( cart.chip != null ) {
				cart.chip.del();
				cart.chip = null;
			}
		}	

		this.cart = [];
		this.sequence = [];
		this.inGame = 0;
	}
}
