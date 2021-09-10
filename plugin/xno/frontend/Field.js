class Field #lx:namespace im {
    constructor(context) {
        this.context = context;
        this.initHandlers();
    }

	isFull() {
		var isFull = true;
	    this.eachCell(cell=>{
	    	if (!cell.isUsedBy)
	    		isFull = false;
	    });
	    return isFull;
	}

	findLine() {
		return this.checkLine([0, 0], [0, 1], [0, 2])
			|| this.checkLine([1, 0], [1, 1], [1, 2])
			|| this.checkLine([2, 0], [2, 1], [2, 2])
			|| this.checkLine([0, 0], [1, 0], [2, 0])
			|| this.checkLine([0, 1], [1, 1], [2, 1])
			|| this.checkLine([0, 2], [1, 2], [2, 2])
			|| this.checkLine([0, 0], [1, 1], [2, 2])
			|| this.checkLine([0, 2], [1, 1], [2, 0])
			|| false;
	}

	checkLine(crds0, crds1, crds2) {
		var cells = [
			this.getCell(crds0[0], crds0[1]),
			this.getCell(crds1[0], crds1[1]),
			this.getCell(crds2[0], crds2[1])
		];

		if (!cells[0].isUsedBy) return false;

		if (cells[0].isUsedBy == cells[1].isUsedBy && cells[0].isUsedBy == cells[2].isUsedBy)
			return cells;

		return false;
	}

	getCell(x, y) {
		return this.context.plugin->>fieldBox.child(0).child(y * 3 + x);
	}

	clear() {
		this.eachCell(cell=>{
			this.clearCell(cell);
		});
	}

    initHandlers() {
    	this.eachCell(cell=>{
    		cell.align(lx.CENTER, lx.MIDDLE);
    		cell.isUsedBy = false;
    		cell.click(()=>{
    			var game = this.context.game;
    			if (!game.active) {
    				lx.Tost.warning('Начните новую игру!');
    				return;
    			}
    			if (cell.isUsedBy) {
    				lx.Tost.warning('Здесь уже занято!');
    				return;
    			}

    			this.markCell(cell);
    			cell.isUsedBy = this.context.game.currentGamer;
    			game.nextTurn();

    		});
    	});
    }

    markCell(cell) {
		cell.text( this.context.game.currentGamer );
    }

    clearCell(cell) {
    	cell.fill('');
		cell.text('');
		cell.isUsedBy = false;
    }

    eachCell(func) {
    	this.context.plugin->>fieldBox.child(0).getChildren().each(func);
    }
}
