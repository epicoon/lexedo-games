#lx:module lexedo.games.ChessOnline;

#lx:require src/;

class Game #lx:namespace lexedo.games.Chess extends lexedo.games.Game {
	constructor(plugin, env) {
		super(plugin, env);
		#lx:require -F src/tool/__classInit;

		this._environment.chessBoard = new lexedo.games.Chess.ChessBoard(plugin, env);
		this._environment.chessPieces = new lexedo.games.Chess.ChessPieces(plugin, env);

		this.pending = true;
		this.gamers = ['white', 'black'];
		this.localGamer = null;

		this.getEvents().subscribe('pieceMoved', [this, this.onPieceMoved]);

		this.reset();
	}

	onStuffed() {
		// pass
	}

	onBegin(data) {
		this.pending = false;
		this.localGamer = data.color;
		if (this.localGamer == 'black') {
			this.getChessBoard().rotate();
		}
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

		this._environment.triggerChannelEvent('move-piece', {
			id: piece.id,
			color: piece.color,
			destination
		});
	}

	endTurn() {
		this._activeGamer = (this._activeGamer == 'white')
			? 'black'
			: 'white';
	}

	isActivePiece(piece) {
		if (this.pending) return false;
		if (piece.color != this.localGamer) return false;
		return piece.color == this._activeGamer;
	}

	resetBoard() {
		this.getChessBoard().reset();
		this.getChessPieces().toStartPosition();		
	}
}



class EventListener #lx:namespace lexedo.games.Chess extends lexedo.games.ChannelEventListener {
	onMovePiece(event) {
		var data = event.getData();
		var game = this._environment.game;
		var cell = game.getChessBoard().getCell(data.destination);
		var piece = game.getChessPieces().getPiece(data.id);
		if (cell.piece) cell.piece.die();
		piece.toPosition(data.destination);

		game.endTurn();
	}
}
