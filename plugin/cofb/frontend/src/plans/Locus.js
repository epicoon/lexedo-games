#lx:macros Const {lexedo.games.Cofb.Constants};

class Locus #lx:namespace lexedo.games.Cofb {
	constructor(name, x, z, parent) {
		this.name = name;
		this.x = x;
		this.z = z;
		this.parent = parent;
		this.chips = [];
	}

	filledHeight() {
		var h = 0;
		for (var i in this.chips) h += this.chips[i].sizes[1];
		return h;
	}

	remove(chip) {
		var index = this.chips.indexOf(chip);
		if (index == -1) return;
		this.chips.splice(index, 1);
		var h = this.parent.surface();
		for (var i in this.chips) {
			var ch = this.chips[i];
			ch.mesh.position.y = h + ch.sizes[1] * 0.5;
			h += ch.sizes[1];
		}
	}

	locate(chip) {
		if (chip.locus != null) chip.locus.remove(chip);

		chip.locus = this;

		var x = this.x * >>>Const.FIELD_SIZE,
			z = this.z * >>>Const.FIELD_SIZE;

		chip.putOn( this.parent );
		chip.mesh.position.x += x;
		chip.mesh.position.z += z;
		chip.mesh.position.y += this.filledHeight();

		this.chips.push(chip);
	}

	coords() {
		var x = this.parent.mesh.position.x + this.x * >>>Const.FIELD_SIZE,
			y = this.parent.surface() + this.filledHeight(),
			z = this.parent.mesh.position.z + this.z * >>>Const.FIELD_SIZE;
		return [x, y, z];
	}

	delChips(amt) {
		if (amt === undefined) amt = this.chips.length;
		if ( amt > this.chips.length ) amt = this.chips.length;

		for (var i=0; i<amt; i++) {
			var chip = this.chips.pop();
			chip.del();
		}
	}
}
