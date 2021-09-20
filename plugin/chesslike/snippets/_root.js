/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

var box = new lx.Box({geom: true});
box.slot({cols: 1, rows: 1, indent: '10px'});
var slot = box.child(0);
slot.border();

var board = slot.add(lx.Box, {key:'board', geom: true});

var cols = 8, rows = 8;
board.gridProportional({cols, rows});
board.chessSize = {cols, rows};

var styles = ['white', 'gray'];

for (var i=0, l=rows; i<l; i++) {
	for (var j=0, ll=cols; j<ll; j++) {
		var style = styles[(i+j)%2];
		board.add(lx.Box, {style: {fill:style}});
	}
}

var whiteSet = [
	{ name: 'king',   positions: ['E1'], picture: 'white_king.png'  },
	{ name: 'queen',  positions: ['D1'], picture: 'white_queen.png' },
	{ name: 'bishop', positions: ['C1', 'F1'], picture: 'white_bishop.png' },
	{ name: 'knight', positions: ['B1', 'G1'], picture: 'white_knight.png' },
	{ name: 'rock',   positions: ['A1', 'H1'], picture: 'white_rock.png'   },
	{ name: 'pawn',   positions: ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], picture: 'white_pawn.png' }
];
var blackSet = [
	{ name: 'king',   positions: ['E8'], picture: 'black_king.png'  },
	{ name: 'queen',  positions: ['D8'], picture: 'black_queen.png' },
	{ name: 'bishop', positions: ['C8', 'F8'], picture: 'black_bishop.png' },
	{ name: 'knight', positions: ['B8', 'G8'], picture: 'black_knight.png' },
	{ name: 'rock',   positions: ['A8', 'H8'], picture: 'black_rock.png'   },
	{ name: 'pawn',   positions: ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], picture: 'black_pawn.png' }
];

var piecesSpace = slot.add(lx.Box, {key: 'piecesSpace', geom: true});
piecesSpace.begin();

whiteSet.forEach(piece=>{
	for (var i=0, l=piece.positions.len; i<l; i++) {
		var box = new lx.Box({
			key: piece.name + '_' + piece.positions[i],
			geom: [0, 0, '130px', '130px']
		});
		box.picture(piece.picture);
		box.chessPiece = { name: piece.name, position: piece.positions[i], gamer: 'white' };
		box.hide();
	}
});
blackSet.forEach(piece=>{
	for (var i=0, l=piece.positions.len; i<l; i++) {
		var box = new lx.Box({
			key: piece.name + '_' + piece.positions[i],
			geom: [0, 0, '130px', '130px']
		});
		box.picture(piece.picture);
		box.chessPiece = { name: piece.name, position: piece.positions[i], gamer: 'black' };
		box.hide();
	}
});

piecesSpace.end();
