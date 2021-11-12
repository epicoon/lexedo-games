#lx:private;
#lx:require figures/;
#lx:require classes/;

let gameInstance = null;

class Game extends lx.BindableModel #lx:namespace tetris {
	#lx:schema level, lines, score;

	constructor(plugin) {
		super();

		this.plugin = plugin;
		
		this.nextFigure = null;
		this.activeFigure = null;

		this.timer = new tetris.Timer(this);
		this.map = new tetris.Map(Plugin->>map);
		this.miniMap = new tetris.Map(Plugin->>next);

		this.active = false;

		gameInstance = this;
	}

	static get instance() {
		return gameInstance;
	}

	newGame() {
		this.reset();
		this.genFigure();
		this.resume();
		Plugin->>pause.disabled(false);
	}

	over() {
		this.active = false;
		this.timer.stop();
		Plugin->>pause.disabled(true);
		lx.Tost('Game over');

		^Respondent.checkLeaderPlace(this.score).then(response=>{
			let place = response.data;
			if (place === false) return;

			Plugin.root->inputPopup.open('You took the place number ' + place + '. Enter your name')
				.confirm(name=>{
					^Respondent.updateLeaders({
						name,
						score: this.score,
						level: this.level
					}).then(()=>this.plugin.trigger('tetris_change_leaders'));
					lx.Tost('You was saved to the hall of honor!');
				});
		});
	}

	stop() {
		if (!this.active) return;
		this.active = false;
		this.timer.stop();
		Plugin->>pause.text('Resume');
	}

	resume() {
		if (this.active) return;
		this.active = true;
		this.timer.start();
		Plugin->>pause.text('Pause');
	}

	toggleActivity() {
		if (this.active) this.stop();
		else this.resume();
	}

	reset() {
		if (this.nextFigure) this.miniMap.clearFigure(this.nextFigure);
		this.activeFigure = null;
		this.nextFigure = null;

		this.level = 1;
		this.setSpeed();
		this.lines = 0;
		this.score = 0;
		this.map.reset();
	}

	genFigure() {
		if (this.nextFigure) this.miniMap.clearFigure(this.nextFigure);
		else this.nextFigure = tetris.Figure.getRand();

		this.activeFigure = this.nextFigure;
		this.nextFigure = tetris.Figure.getRand();
		this.miniMap.highlightFigure(this.nextFigure);

		if (!this.moveFigure([(this.map.colsCount - 4) * 0.5, 0]))
			this.fixFigure();
	}

	moveFigure(shift) {
		var figure = this.activeFigure;
		var coords = [
			figure.coords[0] + shift[0],
			figure.coords[1] + shift[1]
		];

		var cells = this.map.getFreeCells(figure.mask(coords));
		if (!cells) return false;

		this.map.clearFigure(figure);
		figure.coords = coords;
		this.map.highlightFigure(figure);

		return true;
	}

	fallFigure() {
		if (!this.moveFigure([0, 1]))
			this.fixFigure();
	}

	fixFigure() {
		var mask = this.activeFigure.mask();

		if (!this.map.getFreeCells(mask)) {
			this.map.highlightFigure(this.activeFigure);
			this.over();
			return;
		}

		this.map.fix(mask);
		this.genFigure();
	}

	addLines(lines) {
		this.lines += lines;

		var score = 0;
		switch (lines) {
			case 1: score = 1; break;
			case 2: score = 3; break;
			case 3: score = 6; break;
			case 4: score = 10; break;
		}

		this.score += score;

		var level = Math.floor(this.lines * 0.1) + 1;
		if (level != this.level) this.upLevel();
	}

	upLevel() {
		this.level++;
		this.setSpeed();
	}

	setSpeed() {
		this.timer.periodDuration = Math.floor(1000 / (this.level + 1));
	}
}
