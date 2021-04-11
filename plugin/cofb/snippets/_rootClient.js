/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

//======================================================================================================================
// Кнопка открытия меню создания игры
Snippet->butNewGame.click(()=>{
	var menu = Snippet->newGameMenu;

	// console.log(menu);

	if (menu.visibility()) {
		menu.close();
		return;
	}

	if (!cofb.status.isNone() && !cofb.status.isOver())
		Snippet->confirmPopup.open('Вы уверены, что хотите начать новую игру? Текущая будет сброшена.', ()=>{
			//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			bgGame.reset();
			menu.open()
		});
	else menu.open();
});


//======================================================================================================================
// Подсказка что делать в данный момент
const hintBox = Snippet->lblHint;
cofb.EventSupervisor.subscribe('cofb_status_changed', function(status) {
	switch (status) {
		case cofb.Status.PHASE_ACTIVATE : {
			hintBox.text('Кликните по товарам фазы, чтобы начать');
		} break;
		case cofb.Status.PLAY_CUBES : {
			hintBox.text('Разыграйте кубики - кликните любой'); 
		} break;
	}
});
cofb.EventSupervisor.subscribe('cofb_gamer_activated', function(gamer) {
	hintBox.text('Ходит игрок ' + gamer.getName());
});


//======================================================================================================================
// Сообщение о том, что ход закончился, кликабелен для передачи хода другому игроку
const turnEndsBox = Snippet->lblTurnEnds;
turnEndsBox.click(function() {
	this.hide();

	//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	bgGame.passMove();
});
cofb.EventSupervisor.subscribe('cofb_gamer_move_ends', function(gamer) {
	turnEndsBox.show();
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
cofb.EventSupervisor.subscribe('cofb_active_cube_changed', function(newValue) {
	statusIcon.picture('cube' + newValue + '.jpg');
});
cofb.EventSupervisor.subscribe('cofb_status_changed', function(newStatus, data = {}) {
	if (cofb.status.isPending()) {
		statusIcon.hide();
		return;
	}

	//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	if (bgGame.gamer() && bgGame.gamer().AI) return;

	switch (true) {
		case cofb.status.isGetGoods() :
			statusIcon.start(data.dowble?'getGoods2.png':'getGoods.png');
		break;
		case cofb.status.isUseCube():
			statusIcon.start((data.value==7)?'cubeJoker.jpg':'cube'+data.value+'.jpg', data.event);
			break;
		case cofb.status.isUseSilver(data.event):
			statusIcon.start('silver.jpg', data.event);
			break;
		case cofb.status.isTrade():
			statusIcon.start('trade.png');
		break;
		case cofb.status.isGetBuilding():
			statusIcon.start('getBuilding.png');
		break;
		case cofb.status.isGetMCK():
			statusIcon.start('getMCK.png');
		break;
		case cofb.status.isGetAS():
			statusIcon.start('getAS.png');
		break;
		case cofb.status.isSetChip():
			statusIcon.start('setChip.png');
		break;
	}
});


//======================================================================================================================
// Окошко, показывающее содержимое стопки фишек
const pileContain = Snippet->pileContain;
pileContain->stream.stream({
	rowDefaultHeight: (pileContain.width('px') * 0.55) + 'px',
	indent: '5px'
});
pileContain->stream.add(lx.Box, {style:{fill:'red'}});

pileContain.open = function(locus) {
	if ( !locus.chips.length ) return;
	if ( locus.chips[0].info === undefined ) return;
	if ( locus.chips[0].info.face === undefined ) return;

	this.locusName = locus.name;

	var count = __calcCount(locus);
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
	this.locusName = '';
	this.hide();
};

function __calcCount(locus) {
	var byType = [],
		total = 0;
	for (var i=0; i<locus.chips.length; i++) {
		var chipI = locus.chips[i];
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
	var staff = cofb.world.getIntersectedStaff();
	if (!staff || staff.locus === undefined) {
		pileContain.close();
		return;
	}

	if (pileContain.locusName == staff.locus.name) return;

	pileContain.close();

	if (staff.info == undefined) return;
	if (staff.locus.chips.length == 1) return;
	if (staff.locus.parent == bgGame.field && staff.locus.name.substr(0, 2) == 'st') return;

	pileContain.open(staff.locus);
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
