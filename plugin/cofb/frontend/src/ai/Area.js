class Area #lx:namespace lexedo.games.Cofb.AI {
	constructor() {
		this.cells = [];
		this.groupe = -1;
	}


	contains(num) {
		return ( this.cells.indexOf(num) != -1 );
	}
}
