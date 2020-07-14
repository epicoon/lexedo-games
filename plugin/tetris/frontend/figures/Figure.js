class Figure #lx:namespace tetris {
	constructor(params) {
		this.color = params.color;
		this.masks = params.masks;

		this.coords = [0, 0];
		this.state = 0;
	}

	static get map() {
		if (!this.__map) {
			this.__map = new lx.Dict(#lx:load mapList);
		}

		return this.__map;
	}

	static getRand() {
		var map = this.map;
		var rand = lx.Math.randomInteger(0, map.len - 1);
		var key = map.nthKey(rand);
		return new this(map[key]);
	}

	mask(coords) {
		if (coords === undefined)
			coords = this.coords;
		var result = [],
			index = 0,
			currentMask = this.masks[this.state];
		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				if (currentMask[i][j] == 0) continue;
				result.push({
					x: j + coords[0],
					y: i + coords[1]
				});
			}
		}
		return result;
	}

	nextState() {
		this.state++;
		if (this.state == this.masks.len) this.state = 0;
	}

	prevState() {
		this.state--;
		if (this.state < 0) this.state = this.masks.len - 1;
	}
}
