#lx:public;

var constUp = 2;
var constUpRight = 3;
var constRight = 4;
var constRightDown = 5;
var constDown = 6;
var constDownLeft = 7;
var constLeft = 8;
var constLeftUp = 1;

var yLims = new Array(30);
for (var i=0; i<30; i++) yLims[i] = [0, 0];
var xMin = 0, xMax = 0;

var openCellsAmount = 0;
var flagsAmount = 99;
var gameReseted = true;
var gameOver = false;

var field = new Field();
var face;



function cell() {
	this.value = 0;
	this.flag = false;
	this.opened = false;

	this.init = function(val, flag, opened) { this.value = val; this.flag = flag; this.opened = opened; }
}



//=============================================================================================================================
function Field() {
	this.data = new Array(16);
	this.colors = ['', '#0000ff', '#00ff00', '#ff0000', '#000066', '#660000', '#33cccc', '#000000', '#ffff00'];
	for (var i=0; i<16; i++) {
		this.data[i] = new Array(30);
		for (var j=0; j<30; j++)
			this.data[i][j] = new cell();
	};

	this.calculateCells = function() {
		function calcCell(context, i, j) {
			var val = 0;
			if (i > 0 && j > 0 && context.data[i-1][j-1].value == 9) val++;
			if (j > 0 && context.data[i][j-1].value == 9) val++;
			if (i < 15 && j > 0 && context.data[i+1][j-1].value == 9) val++;
			if (i > 0 && context.data[i-1][j].value == 9) val++;
			if (i < 15 && context.data[i+1][j].value == 9) val++;
			if (i > 0 && j < 29 && context.data[i-1][j+1].value == 9) val++;
			if (j < 29 && context.data[i][j+1].value == 9) val++;
			if (i < 15 && j < 29 && context.data[i+1][j+1].value == 9) val++;
			context.data[i][j].value = val;
		}
		for (var i=0; i<16; i++) for (var j=0; j<30; j++) if (this.data[i][j].value != 9) calcCell(this, i, j);
	}

	this.generate = function(r, c) {
		var amt = 0;
		for (var i=0; i<16; i++) for (var j=0; j<30; j++) if (i != r || j != c) {
			if (lx.Math.randomInteger(1, 4) == 1) {
				this.data[i][j].value = 9;
				amt++;
			}
		}
		// обрезать, но не менее 99
		var g = 1, newAmt = amt;
		if (amt > 99) for (var i=0; i<16; i++) for (var j=0; j<30; j++) {
			if (this.data[i][j].value == 9) {
				if (newAmt > 99 && g % Math.floor(amt / (amt -99)) == 0) {
					this.data[i][j].value = 0;
					newAmt--;
				}
				g++;
			}
		}
		// обрезать недорезанное
		var i = 0, j = 0;
		while (newAmt > 99) {
			if (this.data[i][j].value == 9) {
				this.data[i][j].value = 0;
				newAmt--;
			} else i++;
			if (i == 16) { i = 0; j++; }
		}

		this.calculateCells();
	}

	this.reset = function() {
		for (var i=0; i<16; i++) for (var j=0; j<30; j++) this.data[i][j].init(0, false, false);
	}

	this.checkCell = function(r, c, direction) {
		switch (direction) {
			case constLeftUp : {
				if (r == 0 || c == 0) return [false];
				if ( this.data[r-1][c-1].value == 0 ) return [true, r-1, c-1];
			} break;
			case constUp : {
				if (r == 0) return [false];
				if ( this.data[r-1][c].value == 0 ) return [true, r-1, c];
			} break;
			case constUpRight : {
				if (r == 0 || c == 29) return [false];
				if ( this.data[r-1][c+1].value == 0 ) return [true, r-1, c+1];
			} break;
			case constRight : {
				if (c == 29) return [false];
				if ( this.data[r][c+1].value == 0 ) return [true, r, c+1];
			} break;
			case constRightDown : {
				if (r == 15 || c == 29) return [false];
				if ( this.data[r+1][c+1].value == 0 ) return [true, r+1, c+1];
			} break;
			case constDown : {
				if (r == 15) return [false];
				if ( this.data[r+1][c].value == 0 ) return [true, r+1, c];
			} break;
			case constDownLeft : {
				if (r == 15 || c == 0) return [false];
				if ( this.data[r+1][c-1].value == 0 ) return [true, r+1, c-1];
			} break;
			case constLeft : {
				if (c == 0) return [false];
				if ( this.data[r][c-1].value == 0 ) return [true, r, c-1];
			} break;
		}
		return [false];
	}

	this.findNextCell = function(r, c, direction) {
		var dr;
		if (direction == constUp || direction == constUpRight) dr = constLeftUp;
		else if (direction == constRight || direction == constRightDown) dr = constUpRight;
		else if (direction == constDown || direction == constDownLeft) dr = constRightDown;
		else if (direction == constLeft || direction == constLeftUp) dr = constDownLeft;

		var i = 0;
		while (true) {
			if (dr > 8) dr -= 8;
			var next = this.checkCell(r, c, dr);
			// alert('next ' + next + ' ' + dr);
			if (next[0]) return [next[1], next[2], dr];
			else { dr++; i++; }
			if (i == 8) return [r, c, dr];
		}
	}

	this.findStart = function(r, c) {
		var rStart, cStart;
		var R = r, C = c;
		var bigDone = false;

		while (!bigDone) {
			cStart = C;
			var done = false;
			while (!done) {
				if (cStart == 0 || this.data[R][cStart-1].value != 0 ) done = true;
				else cStart--;
			}
			rStart = R;
			done = false;
			while (!done) {
				if (rStart == 0 || this.data[rStart-1][cStart].value != 0 ) done = true;
				else rStart--;
			}

			bigDone = true;
			if (rStart > 0 && cStart > 0) {
				if ( this.data[rStart-1][cStart-1].value == 0 ) {
					R = rStart-1; C = cStart-1;
					bigDone = false;
				}
			}
		}
		return [rStart, cStart];
	}

	this.checkLims = function(r, c) {
		if (c < xMin) xMin = c;
		if (c > xMax) xMax = c;
		if (r < yLims[c][0]) yLims[c][0] = r;
		if (r > yLims[c][1]) yLims[c][1] = r;
	}

	this.findLims = function(r, c) {
		xMin = c;
		xMax = c;
		for (var i=0; i<30; i++) { yLims[i][0] = 15; yLims[i][1] = 0; }

		var start = this.findStart(r, c);
		var rStart = start[0], cStart = start[1];
		this.checkLims(rStart, cStart);

		var nextR, nextC, direction = constUp;
		var next = this.findNextCell(rStart, cStart, direction);
		nextR = next[0];
		nextC = next[1];
		direction = next[2];
		while (rStart != nextR || cStart != nextC) {
			this.checkLims(nextR, nextC);
			next = this.findNextCell(nextR, nextC, direction);
			nextR = next[0];
			nextC = next[1];
			direction = next[2];
		}

		direction = constDown;
		next = this.findNextCell(rStart, cStart, direction);
		nextR = next[0];
		nextC = next[1];
		direction = next[2];
		while (rStart != nextR || cStart != nextC) {
			this.checkLims(nextR, nextC);
			next = this.findNextCell(nextR, nextC, direction);
			nextR = next[0];
			nextC = next[1];
			direction = next[2];
		}
	}

	this.openNumber = function(r, c) {
		if (this.data[r][c].value == 9 || this.data[r][c].opened) return;
		gameField.cell(r, c).picture('open.jpg');
		this.data[r][c].opened = true;
		if (this.data[r][c].value) {
			gameField.cell(r, c).style('color', this.colors[ this.data[r][c].value ]);
			gameField.cell(r, c).text( '<b>' + this.data[r][c].value + '</b>' );
		}
		openCellsAmount++;
		if (openCellsAmount == 381) {
			gameOver = true;
			face.picture('win.png');
		}
	}

	this.openArea = function(r, c) {
		this.findLims(r, c);

		for (var i=xMin; i<=xMax; i++) {
			if (yLims[i][0] > 0) this.openNumber(yLims[i][0] - 1, i);

			for (var j=yLims[i][0]; j<=yLims[i][1]; j++) {
				if (j > 0) {
					if (i > 0 && this.data[j-1][i-1].value != 0) this.openNumber(j-1, i-1);
					if (i < 29 && this.data[j-1][i+1].value != 0) this.openNumber(j-1, i+1);
				}

				if (this.data[j][i].value != 9 && !this.data[j][i].opened) {
					this.openNumber(j, i);
					if (i > 0 && this.data[j][i-1].value != 0) this.openNumber(j, i-1);
					if (i < 29 && this.data[j][i+1].value != 0) this.openNumber(j, i+1);
				}

				if (j < 15) {
					if (i > 0 && this.data[j+1][i-1].value != 0) this.openNumber(j+1, i-1);
					if (i < 29 && this.data[j+1][i+1].value != 0) this.openNumber(j+1, i+1);
				}
			}
			if (yLims[i][1] < 15) this.openNumber(yLims[i][1] + 1, i);
		}
	}

	this.openCell = function(r, c) {
		if (gameReseted) {
			this.generate(r, c);
			gameReseted = false;
		}

		if (this.data[r][c].value == 9) {
			this.showBombs();
			gameField.cell(r, c).picture('bang.jpg');
			gameOver = true;
			face.picture('fail.png');
			return;
		}

		if ( this.data[r][c].value ) this.openNumber(r, c);
		else this.openArea(r, c);
	}

	this.massOpen = function(r, c) {
		var bombs = 0, fs = 0;
		if (r > 0 && c > 0) {
			if ( this.data[r-1][c-1].value == 9 ) bombs++;
			if ( this.data[r-1][c-1].flag ) fs++;
		}
		if (r > 0) {
			if ( this.data[r-1][c].value == 9 ) bombs++;
			if ( this.data[r-1][c].flag ) fs++;
		}
		if (r > 0 && c < 29) {
			if ( this.data[r-1][c+1].value == 9 ) bombs++;
			if ( this.data[r-1][c+1].flag ) fs++;
		}
		if (c > 0) {
			if ( this.data[r][c-1].value == 9 ) bombs++;
			if ( this.data[r][c-1].flag ) fs++;
		}
		if (c < 29) {
			if ( this.data[r][c+1].value == 9 ) bombs++;
			if ( this.data[r][c+1].flag ) fs++;
		}
		if (r < 15 && c > 0) {
			if ( this.data[r+1][c-1].value == 9 ) bombs++;
			if ( this.data[r+1][c-1].flag ) fs++;
		}
		if (r < 15) {
			if ( this.data[r+1][c].value == 9 ) bombs++;
			if ( this.data[r+1][c].flag ) fs++;
		}
		if (r < 15 && c < 29) {
			if ( this.data[r+1][c+1].value == 9 ) bombs++;
			if ( this.data[r+1][c+1].flag ) fs++;
		}
		if (bombs != fs) return;

		if (r > 0 && c > 0 && !this.data[r-1][c-1].flag && !this.data[r-1][c-1].opened) this.openCell(r-1, c-1);
		if (r > 0 && !this.data[r-1][c].flag && !this.data[r-1][c].opened) this.openCell(r-1, c);
		if (r > 0 && c < 29 && !this.data[r-1][c+1].flag && !this.data[r-1][c+1].opened) this.openCell(r-1, c+1);
		if (c > 0 && !this.data[r][c-1].flag && !this.data[r][c-1].opened) this.openCell(r, c-1);
		if (c < 29 && !this.data[r][c+1].flag && !this.data[r][c+1].opened) this.openCell(r, c+1);
		if (r < 15 && c > 0 && !this.data[r+1][c-1].flag && !this.data[r+1][c-1].opened) this.openCell(r+1, c-1);
		if (r < 15 && !this.data[r+1][c].flag && !this.data[r+1][c].opened) this.openCell(r+1, c);
		if (r < 15 && c < 29 && !this.data[r+1][c+1].flag && !this.data[r+1][c+1].opened) this.openCell(r+1, c+1);
	}

	this.showBombs = function() {
		for (var i=0; i<16; i++) for (var j=0; j<30; j++) if (this.data[i][j].value == 9) {
			if (!this.data[i][j].flag) gameField.cell(i, j).picture('bomb.jpg');
		} else if (this.data[i][j].flag) gameField.cell(i, j).picture('wrongFlag.jpg');
	}

	this.show = function() {
		for (var i=0; i<16; i++) for (var j=0; j<30; j++)
			gameField.cell(i, j).text( this.data[i][j].value );
	}
}
//=============================================================================================================================



function cellClick(event, context) {
	if (gameOver) return;
	var crds = context.indexes();
	var cell = field.data[ crds[0] ][ crds[1] ];

	if (event.button == 2) {
		if (!cell.opened) {
			cell.flag = !cell.flag;
			if (cell.flag) { context.picture('flag.jpg'); flagsAmount--; }
			else { context.picture('cell.jpg'); flagsAmount++; }
			counter.text('<b>' + flagsAmount + '</b>');
			return;
		} else {
			if (!cell.flag) field.massOpen(crds[0], crds[1]);
		}
	} else if (event.button == 0) {
		if (cell.flag) return;
		field.openCell(crds[0], crds[1]);
	}
}


function newGame() {
	field.reset();
	for (var i=0; i<16; i++) for (var j=0; j<30; j++) {
		gameField.cell(i, j).picture('cell.jpg');
		if (gameField.cell(i, j).text() != '')
			gameField.cell(i, j).text('');
	}

	face.picture('smile.png');
	openCellsAmount = 0;
	flagsAmount = 99;
	counter.text('<b>' + flagsAmount + '</b>');
	gameReseted = true;
	gameOver = false;
}
