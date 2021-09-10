#lx:private;

class ChessBoard #lx:namespace lexedo.games.Chess {
	constructor(plugin, env) {
		#lx:require -F tool/__classInit;

		this.box = this._plugin->>board;
		var index = 0;
		this.cells = {};
		this.box.getChildren((cellBox)=> {
			var horIndex = index % this.box.chessSize.rows;
			var hor = String.fromCharCode(horIndex + 65);
			var vert = this.box.chessSize.rows - Math.floor((index - horIndex) / this.box.chessSize.rows);
			this.cells[hor + vert] = new lexedo.games.Chess.ChessCell(this._plugin, env, cellBox, hor + vert);
			index++;
		});
		this.whiteOrientation = true;
	}

	rotate() {
		this.whiteOrientation = !this.whiteOrientation;
		var index = 0;
		var cells = {};
		this.each(cell=>{
			var horIndex = index % this.box.chessSize.rows;
			var vert = this.box.chessSize.rows - Math.floor((index - horIndex) / this.box.chessSize.rows);
			if (!this.whiteOrientation) {
				horIndex = this.box.chessSize.cols - horIndex - 1;
				vert = this.box.chessSize.rows - vert + 1;
			}
			var hor = String.fromCharCode(horIndex + 65);
			var key = hor + vert;
			cell.id = key;
			cells[key] = cell;
			index++;
		});
		this.cells = cells;
		this.getChessPieces().returnToPosition();
	}

	each(func) {
		for (var i in this.cells) func(this.cells[i]);
	}

	reset() {
		this.each(cell=>cell.piece = null);
	}

	getBoardBox() {
		return this.box;
	}

	getCell(name) {
		return this.cells[name];
	}

	getCellByPoint(x, y) {
		var w = this.box.child(0).width('px'),
			h = this.box.child(0).height('px');

		var col = Math.floor( x / w );
		var correction = x % w;
		if (correction > w*0.5) col++;
		if (col > this.box.chessSize.cols - 1) col = this.box.chessSize.cols - 1;

		var row = Math.floor( y / h );
		var correction = y % h;
		if (correction > h*0.5) row++;
		if (row > this.box.chessSize.rows - 1) row = this.box.chessSize.rows - 1;

		if (this.whiteOrientation) {
			col = String.fromCharCode(col + 65);
			row = this.box.chessSize.rows - row;
		} else {
			col = String.fromCharCode((this.box.chessSize.cols - col) + 64);
			row = row + 1;			
		}

		return this.getCell(col + row);
	}

}
