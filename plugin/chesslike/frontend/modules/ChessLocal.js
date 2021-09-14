#lx:module lexedo.games.ChessLocal;

#lx:require src/;

class Game #lx:namespace lexedo.games.Chess {
	constructor(env) {
		#lx:require -F src/tool/__classInit;

		var plugin = env.getPlugin();
		this._environment.chessBoard = new lexedo.games.Chess.ChessBoard(plugin, env);
		this._environment.chessPieces = new lexedo.games.Chess.ChessPieces(plugin, env);

		this.gamers = ['white', 'black'];

		this.getEvents().subscribe('pieceMoved', [this, this.onPieceMoved]);

		this.reset();
	}

	reset() {
		this.resetBoard();
		this._activeGamer = 'white';
	}

	onPieceMoved(piece, destination) {
		if (!this.isActivePiece(piece)) {
			piece.returnToPosition();
			return;
		}

		var cell = this.getChessBoard().getCell(destination);
		if (cell.piece) cell.piece.die();
		piece.toPosition(destination);

		this.endTurn();
	}

	endTurn() {
		this._activeGamer = (this._activeGamer == 'white')
			? 'black'
			: 'white';
	}

	isActivePiece(piece) {
		return piece.color == this._activeGamer;
	}

	resetBoard() {
		this.getChessBoard().reset();
		this.getChessPieces().toStartPosition();		
	}
}
