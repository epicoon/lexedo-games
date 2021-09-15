/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:macros Const {lexedo.games.Cofb.Constants};

//======================================================================================================================
// Кнопка открытия меню создания игры
Snippet->butNewGame.click(()=>{
	var menu = Snippet->newGameMenu;

	if (menu.visibility()) {
		menu.close();
		return;
	}

	let game = Plugin.environment.getGame();
	if (!game.status.isNone() && !game.status.isOver())
		Snippet->confirmPopup.open('Вы уверены, что хотите начать новую игру? Текущая будет сброшена.', ()=>{
			game.reset();
			menu.open()
		});
	else menu.open();
});


//======================================================================================================================
// Сообщение о том, что ход закончился, кликабелен для передачи хода другому игроку
const turnEndsBox = Snippet->lblTurnEnds;
turnEndsBox.click(function() {
	this.hide();
	Plugin.environment.getGame().passMove();
});


//======================================================================================================================
// Иконка, сопровождающая мышь, показывающая какое сейчас совершается действие
const statusIcon = Snippet->statusIcon;
statusIcon.locate = function(e) {
	this.left(e.clientX + 5 + 'px');
	this.top(e.clientY - this.height('px') - 5 + 'px');
};
statusIcon.start = function(pic, event) {
	this.picture(pic);
	this.show();
	if (event) this.locate(event);
};
lx.on('mousemove', function(event) {
	if ( !statusIcon.visibility() ) return;
	event = event ||  window.event;
	statusIcon.locate(event);
});


//======================================================================================================================
// Окошко, показывающее содержимое стопки фишек
const pileContain = Snippet->pileContain;
pileContain->stream.stream({
	rowDefaultHeight: (pileContain.width('px') * 0.55) + 'px',
	indent: '5px'
});
pileContain->stream.add(lx.Box, {style:{fill:'red'}});

pileContain.open = function(tyle) {
	if ( !tyle.chips.length ) return;
	if ( tyle.chips[0].info === undefined ) return;
	if ( tyle.chips[0].info.face === undefined ) return;

	this.tyleName = tyle.name;

	var count = __calcCount(tyle);
	if (count === false) return;

	this->stream.clear();
	this->stream.add(lx.Box, count.total, {key: 'cell'});
	this.height(this->stream.height('px') + 'px');

	var counter = 0,
		cells = lx.Collection.cast(this->>cell);

	for (var key in count.byType) {
		var info = count.byType[key],
			cell = cells.at(counter++);

		var pic = cell.add(lx.Box, {geom:true, width:75});
		pic.picture(info.chip.info.face() + '.jpg');

		var text = cell.add(lx.Box, {
			width: 25, right: 0,
			text: info.counter
		});
		text.align(lx.CENTER, lx.MIDDLE);
		text.fill('black');
		text.style('color', 'white');
	}

	this.show();
};

pileContain.close = function() {
	this.tyleName = '';
	this.hide();
};

function __calcCount(tyle) {
	var byType = [],
		total = 0;
	for (var i=0; i<tyle.chips.length; i++) {
		var chipI = tyle.chips[i];
		if (chipI.info === undefined) return false;
		var key = 'v' + chipI.info.variant;
		if ( key in byType ) byType[key].counter++;
		else {
			byType[key] = { chip : chipI, counter : 1};
			total++;
		}
	}

	return { byType, total };
}

Snippet->canvas.on('mousemove', function() {
	let game = Plugin.environment.getGame();
	if (!game) return;
	
	let staff = game.world.getIntersectedStaff();
	if (!staff || !staff.tyle) {
		pileContain.close();
		return;
	}

	if (pileContain.tyleName == staff.tyle.name) return;

	pileContain.close();

	if (staff.info == undefined) return;
	if (staff.tyle.chips.length == 1) return;
	if (staff.tyle.parent == game.field && staff.tyle.name.substr(0, 2) == 'st')
		return;

	pileContain.open(staff.tyle);
});


//======================================================================================================================
// Отображение заработанных только что очков
const floatPoints = Snippet->floatPoints;
floatPoints.w0 = 15;
floatPoints.h0 = 3;
floatPoints.increase = 3;
floatPoints.x0 = 0;
floatPoints.y0 = 0;

floatPoints.animator = new lx.Timer([700, 300]);
floatPoints.animator.setAction([
	function() {
		var ctx = floatPoints,
			k = 1 + this.shift() * (ctx.increase - 1),
			w = ctx.w0 * k,
			h = ctx.h0 * k,
			amt = ctx->tab.rowsCount();

		ctx.width(w + '%');
		ctx.height(h * amt + '%');
		ctx.left(ctx.x0 - ctx.width('px') * 0.5 + 'px');
		ctx.top(ctx.y0 - ctx.height('px') * 0.5 + 'px');
		ctx.trigger('resize');

		ctx->tab.cells().call('align', lx.CENTER, lx.MIDDLE);

		var text = ctx->>text;
		lx.TextBox.adaptTextByMin(text);
	},
	function() {
		floatPoints.opacity(1 - this.shift());

		if (this.periodEnds()) {
			this.stop();
			floatPoints.opacity(1);
			floatPoints.hide();
		}

	}
]);

floatPoints.start = function(msgs, x, y) {
	this->tab.setRowsCount( msgs.length );
	for (var i=0; i<msgs.length; i++) {
		this->tab.cell(i, 0).text( '<b>' + msgs[i] + '</b>' );
		this->tab.cell(i, 0)->text.wrap('nowrap');
	}

	this.x0 = lx.getFirstDefined(x, Snippet->canvas.width('px') * 0.5);
	this.y0 = lx.getFirstDefined(y, Snippet->canvas.height('px') * 0.5);

	this.animator.start();
	this.show();
};


//======================================================================================================================
// Всплывающая подсказка
#lx:require floatHintClient;
