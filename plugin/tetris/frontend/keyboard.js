#lx:private;

lx.on('keydown', (event)=>{
	var game = tetris.Game.instance;
	if (!game.active || !game.activeFigure) return;

	var code = event.charCode ? event.charCode: event.keyCode;
	switch (+code) {
		case 40: toDown(); break;
		case 37: toLeft(); break;
		case 39: toRight(); break;
		case 38: nextState(); break;
		case 13: nextState(); break;

		case 81: game.toggleActive(); break;
	}
});

function toLeft() {
	tetris.Game.instance.moveFigure([-1, 0]);
}

function toRight() {
	tetris.Game.instance.moveFigure([1, 0]);
}

function toDown() {
	tetris.Game.instance.fallFigure();
}

function nextState() {
	var game = tetris.Game.instance,
		figure = game.activeFigure;

	game.map.clearFigure(figure);

	figure.nextState();
	if (!confirmFigureState())
		figure.prevState();

	game.map.highlightFigure(figure);
}

function confirmFigureState() {
	return confirmDirection(-1) || confirmDirection(1);
}

function confirmDirection(shift) {
	var game = tetris.Game.instance,
		figure = game.activeFigure,
		coords = [figure.coords[0], figure.coords[1]],
		attempts = 0;

	while (!game.map.getFreeCells(figure.mask(coords))) {
		coords[0] += shift;
		if (++attempts == game.map.colsCount) return false;
	}

	if (attempts) figure.coords = coords;
	return true;
}
