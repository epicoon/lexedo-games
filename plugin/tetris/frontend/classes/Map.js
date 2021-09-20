class Map #lx:namespace tetris {
	constructor(map) {
		this.widget = map;

		this.colsCount = this.widget.colsCount();
		this.rowsCount = this.widget.rowsCount();
		this.rows = [];
	}

	reset() {
		this.rows = [];
		this.widget.cells().forEach((cell)=> this.clearCell(cell));
	}

	cellIsFilled(row, col) {
		return (this.rows[row]
			&& lx.isArray(this.rows[row])
			&& this.rows[row].includes(col)
		);
	}

	getFreeCell(row, col) {
		if (this.cellIsFilled(row, col)) return false;

		var cell = this.widget.cell(row, col);
		if (!cell) return false;

		return cell;
	}

	getFreeCells(mask) {
		var cells = [];
		for (var i in mask) {
			var cell = this.getFreeCell(mask[i].y, mask[i].x);
			if (!cell) return null;
			cells.push(cell);
		}
		return cells;
	}

	fix(mask) {
		for (var i in mask) {
			var item = mask[i];
			if (!this.rows[item.y])
				this.rows[item.y] = [];
			this.rows[item.y].push(item.x);
		}

		this.checkFilled();
	}

	checkFilled() {
		var cols = this.widget.colsCount(),
			rows = this.widget.rowsCount(),
			filled = 0;

		for (var i=rows-1; i>=0; i--) {
			if (!this.rows[i]) break;

			if (this.rows[i].len == cols) {
				this.widget.row(i).cells().forEach((cell)=> this.clearCell(cell));
				this.rows[i] = null;
				filled++;
			} else if (filled) {
				var rowFrom = this.widget.row(i),
					rowTo = this.widget.row(i + filled);

				rowFrom.eachChild((cellFrom)=> {
					if (!this.cellIsFilled(i, cellFrom.index)) return;
					var cellTo = rowTo.cell(cellFrom.index);
					this.highlightCell(cellTo, cellFrom.style('backgroundColor'));
					this.clearCell(cellFrom);
				});

				this.rows[i + filled] = this.rows[i];
				this.rows[i] = null;
			}
		}

		tetris.Game.instance.addLines(filled);
	}

	clearFigure(figure) {
		var cells = this.getFreeCells(figure.mask());
		if (!cells) return;
		cells.forEach((cell)=> this.clearCell(cell));
	}

	highlightFigure(figure) {
		var cells = this.getFreeCells(figure.mask());
		if (!cells) return;
		cells.forEach((cell)=> this.highlightCell(cell, figure.color));
	}

	clearCell(cell) {
		cell.fill('');
		cell.border({color: '', style: ''});
	}

	highlightCell(cell, color) {
		cell.fill(color);
		cell.border();
	}
}
