#lx:private;

class ChessPiece #lx:namespace lexedo.games.Chess {
	constructor(plugin, env, box) {
		#lx:require -F tool/__classInit;

		this.box = box;
		this.id = box.chessPiece.position;
		this.color = box.chessPiece.gamer;
		this.currentPosition = null;
		this.highlightedPosition = null;
		this.box.move();

		this.box.on('moveBegin', ()=>{
			if (this.getGame().isActivePiece(this))
				this.box.unlockMove();
			else
				this.box.lockMove();
		});

		this.box.on('move', ()=>{
			var cell = this.getChessBoard().getCellByPoint(
				this.box.left('px'),
				this.box.top('px')
			);

			if (cell.id == this.highlightedPosition) return;

			if (this.highlightedPosition) {
				this.getChessBoard().getCell(this.highlightedPosition).highlightOff();
				this.highlightedPosition = null;
			}

			if (cell.id == this.currentPosition) return;

			if (cell.piece && cell.piece.color == this.color) return;

			this.highlightedPosition = cell.id;
			cell.highlightOn();
		});

		this.box.on('moveEnd', ()=>{
			if (this.highlightedPosition)
				this.getEvents().trigger('pieceMoved', [this, this.highlightedPosition]);
			else
				this.returnToPosition();
		});
	}

	toStartPosition() {
		this.toPosition(this.id);
		this.box.show();
	}

	returnToPosition() {
		this.toPosition(this.currentPosition);
	}

	toPosition(position) {
		if (this.highlightedPosition) {
			this.getChessBoard().getCell(this.highlightedPosition).highlightOff();
			this.highlightedPosition = null;			
		}

		if (this.currentPosition)
			this.getChessBoard().getCell(this.currentPosition).land(null);

		if (position) {
			var cell = this.getChessBoard().getCell(position);
			cell.land(this);
			this.box.copyGeom(cell.box, 'px');
		}

		this.currentPosition = position;
	}

	die() {
		this.box.hide();
		this.toPosition(null);
	}
}
