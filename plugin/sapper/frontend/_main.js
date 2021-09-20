#lx:require game;

// отключение дефолтного контекстного меню
document.oncontextmenu = function() { return false; };

var gameField = Plugin->>gameField,
	face = Plugin->>face,
	counter = Plugin->>counter;

gameField.cells().forEach((a)=> {
	a.align(lx.CENTER, lx.MIDDLE);
	a.on('mouseup', function(event) {
		cellClick(event, this);
	});
});

gameField.on('mousedown', function(event) {
	if (gameOver) return;
	face.picture('danger.png');
});
gameField.on('mouseup', function(event) {
	if (gameOver) return;
	face.picture('smile.png');
});

face.click(newGame);

newGame();
