#lx:private;

class ChessPieces #lx:namespace lexedo.games.Chess {
	constructor(plugin, env) {
		#lx:require -F tool/__classInit;

		this.map = {};
		var pieceBoxes = this._plugin->>piecesSpace.getChildren({hasProperty:'chessPiece'});
		pieceBoxes.each(pieceBox=>{
			this.map[pieceBox.chessPiece.position] = new lexedo.games.Chess.ChessPiece(this._plugin, env, pieceBox);
		});

		this._plugin->>board.on('resize', ()=>this.returnToPosition());
	}

	getPiece(id) {
		return this.map[id];
	}

	each(func) {
		for (var i in this.map) func(this.map[i]);
	}

	toStartPosition() {
		this.each(piece=>piece.toStartPosition());
	}

	returnToPosition() {
		this.each(piece=>piece.returnToPosition());
	}
}
