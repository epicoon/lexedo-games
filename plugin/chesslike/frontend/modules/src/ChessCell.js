class ChessCell #lx:namespace lexedo.games.Chess {
	constructor(plugin, env, box, id) {
		#lx:require -F tool/__classInit;

		this.box = box;
		this.id = id;
		this.piece = null;
	}

	land(piece) {
		this.piece = piece;
	}

	highlightOn() {
		if (this.box.contains('light')) return;
		this.box.add(lx.Box, {
			key: 'light',
			geom: true,
			style: {
				fill: 'green',
				opacity: 0.5
			}
		});
	}

	highlightOff() {
		if (!this.box.contains('light')) return;
		this.box.del('light');
	}
}
