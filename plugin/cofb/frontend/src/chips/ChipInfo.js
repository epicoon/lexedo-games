#lx:macros Const {lexedo.games.Cofb.Constants};

class ChipInfo #lx:namespace lexedo.games.Cofb {
	constructor(groupe, variant, pack) {
		this.groupe = groupe;
		this.variant = variant;
		this.pack = pack;
		this.packs = pack.packs;
		this.chip = null;
	}

	getGame() {
		return this.packs.game;
	}

	face() {
		if (this.groupe == >>>Const.GROUPE_GOODS) return 'goods' + this.variant;

		var black = false;
		if ( this.packs['black'] === this.pack ) black = true;
		return this.packs.getFace(this.variant, black);
	}

	genChip() {
		var chip = new lexedo.games.Cofb.Chip(this.getGame(), this);
		chip.create({face : this.face(), side : this.pack.side, back : this.pack.back});
		this.chip = chip;
		return chip;
	}
}
