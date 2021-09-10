this._plugin = plugin;
this._environment = env;

this.getEvents = function() {
	return this._environment._eventCore;
};

this.getGame = function() {
	return this._environment.game;
};

this.getChessBoard = function() {
	return this._environment.chessBoard;
};

this.getChessPieces = function() {
	return this._environment.chessPieces;
};
