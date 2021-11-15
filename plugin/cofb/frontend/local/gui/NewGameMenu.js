#lx:macros Const {lexedo.games.Cofb.Constants};

#lx:use lx.Checkbox;

class NewGameMenu #lx:namespace lexedo.games.local.gui {
	constructor(game) {
		this.game = game;

		#lx:model-collection selectedGamersList = {
			num,
			icon,
			name,
			seq: {default: '?'},
			ai: {default: false}
		};
		this.selectedGamersList = selectedGamersList;

		#lx:model-collection gamersList = {
			num,
			icon,
			name,
			checked: {default: false}
		};
		this.gamersList = gamersList;
		this.gamersList.reset([
			{num:0, icon: >>>Const.GAMER_COLOR[0] + '.jpg', name: >>>Const.GAMER_NAMES[0]},
			{num:1, icon: >>>Const.GAMER_COLOR[1] + '.jpg', name: >>>Const.GAMER_NAMES[1]},
			{num:2, icon: >>>Const.GAMER_COLOR[2] + '.jpg', name: >>>Const.GAMER_NAMES[2]},
			{num:3, icon: >>>Const.GAMER_COLOR[3] + '.jpg', name: >>>Const.GAMER_NAMES[3]}
		]);
		this.gamersList.modelClass.afterSet('checked', ()=>{
			this.selectedGamersList.reset();
			this.gamersList.forEach(model=>{
				if (model.checked)
					this.selectedGamersList.add(model.getFields())
			});
		});

		this.game.getPlugin().root.begin();
		this.boxes = __render();
		this.game.getPlugin().root.end();
		__initOpenButton(this);
		__initMenu(this);
	}

	startGame() {
		var list = [0, 0, 0, 0, 0, 0];
		this.selectedGamersList.forEach(gamer=>{
			list[gamer.seq] = {num: gamer.num, ai: gamer.ai};
		});
		this.gamersList.forEach(gamer=>gamer.checked=false);
		var sequence = [];
		list.forEach(item=>{
			if (item) sequence.push(item);
		});
		this.game.start(sequence);
	}
}

function __needSequens(self) {
	var model = null;
	self.selectedGamersList.forEach(function(gamer) {
		if (gamer.seq == '?') {
			model = gamer;
			this.stop();
		}
	});
	return model;
}

function __genSequens(self) {
	var rand = lx.Math.randomInteger(1, 6);	

	// Чтобы исключить ситуации, когда поровну борошен кубик
	function checkSame(val) {
		var match = false;
		self.selectedGamersList.forEach(gamer=>{
			if (gamer.seq == val) match = true;
		});
		return match;
	}
	if (checkSame(rand)) {
		// Случайно определим - вверх будем искать неповторяющееся значение или вниз
		var direction = lx.Math.randomInteger(1, 2) == 1 ? -1 : 1;
		while (checkSame(rand)) {
			rand += direction;
			if (rand == 7) rand = 1;
			else if (rand == 0) rand = 6;
		}
	}

	return rand;
}

function __initOpenButton(self) {
	self.boxes.butNewGame.click(()=>{
		var menu = self.boxes.newGameMenu;

		if (menu.visibility()) {
			menu.close();
			return;
		}

		let game = self.game;
		if (!game.status.isNone() && !game.status.isOver())
			Snippet->confirmPopup.open('Вы уверены, что хотите начать новую игру? Текущая будет сброшена.')
				.confirm(()=>{
					game.reset();
					menu.open()
				});
		else menu.open();
	});
}

function __initMenu(self) {
	console.log(self.boxes);
	self.boxes.butClose.forEach(but=>but.click(()=>menu.hide()));

	let menu = self.boxes.newGameMenu,
		firstStep = menu->>firstStep,
		secondStep = menu->>secondStep;
	menu.open = function() {
		menu.show();
		firstStep.show();
		secondStep.hide();
	};

	firstStep->>butOk.click(()=>{
		if (self.selectedGamersList.len < 2) {
			lx.Tost.warning('Выберите минимум двух игроков');
			return;
		}

		firstStep.hide();
		secondStep.show();
		if (__needSequens(self))
			secondStep->>cube.addClass('pulse');
	});

	secondStep->>butOk.click(()=>{
		if (__needSequens(self)) {
			lx.Tost.warning('Сначала нужно определить порядок ходов. Кликните по кубику');
			return;
		}

		menu.hide();
		self.startGame();
	});
	secondStep->>butBack.click(()=>{
		secondStep.hide();
		firstStep.show();
	});
	secondStep->>cube.click(function() {
		var model = __needSequens(self);
		if (!model) return;
		model.seq = __genSequens(self);
		if (model === self.selectedGamersList.last())
			this.removeClass('pulse');
	});

	firstStep->gamersList.matrix({
		items: self.gamersList,
		itemBox: [lx.Box, {grid:true}],
		itemRender: function(box, model) {
			var color = new lx.Box({width: 2});
			color.setField('icon', function(val) {this.picture(val)});
			color.border({color:'gray'});

			(new lx.Box({field:'name', width:8})).align(lx.CENTER, lx.MIDDLE);

			var ch = new lx.Box({width: 2});
			var check = ch.add(lx.Checkbox, {field:'checked'});
			ch.align(lx.CENTER, lx.MIDDLE);
		}
	});
	secondStep->gamersList.matrix({
		items: self.selectedGamersList,
		itemBox: [lx.Box, {grid:true}],
		itemRender: function(box, model) {
			var color = new lx.Box({width: 2});
			color.setField('icon', function(val) {this.picture(val)});
			color.border({color:'gray'});

			(new lx.Box({field:'name', width:8})).align(lx.CENTER, lx.MIDDLE);

			var seq = new lx.Box({field:'seq'});
			seq.align(lx.CENTER, lx.MIDDLE);
			seq.setAttribute('title', 'Очередность хода');

			var ch = new lx.Box();
			ch.setAttribute('title', 'За игрока будет действовать компьютер');
			var check = ch.add(lx.Checkbox, {field: 'ai'});
			ch.align(lx.CENTER, lx.MIDDLE);
		}
	});
}

#lx:tpl-function __render() {
	<lx.Box:@butNewGame.cofbBut>(geom: [1, 1, 10, 5], text: 'Новая игра').align(lx.CENTER, lx.MIDDLE)
	<lx.Box:@newGameMenu>(geom:[1, 6, '400px', '400px']).hide()
		<lx.Box:._vol>.fill('black').style('color', 'white')
			<lx.Box:@firstStep._vol>
				.streamProportional()
				<lx.Box>(text:'Игроки').align(lx.CENTER, lx.MIDDLE)
				<lx.Box:@gamersList>(height:4)
					.streamProportional(indent:'10px', paddingY:'1px', direction: lx.VERTICAL)
				<lx.Box>
					.gridProportional(cols:2, indent:'10px')
					<lx.Button:@butOk>(text:'Далее')
					<lx.Button:@butClose>(text:'Закрыть')
			<lx.Box:@secondStep._vol>
				.streamProportional()
				<lx.Box:._vol>
					.gridProportional(indent:'10px')
					<lx.Box>(width:10, text:'Порядок хода').align(lx.CENTER, lx.MIDDLE)
					<lx.Box>(width:1).overflow('visible')
						<lx.Box:@cube>(geom:[0, 0, 100, 100], picture:'cube.png')
							.style('cursor', 'pointer')
							.setAttribute('title', 'Нажмите, чтобы определить очередность хода')
					<lx.Box>(width:1, picture:'comp.png')
						.setAttribute('title', 'За игрока будет действовать компьютер')
				<lx.Box:@gamersList>(height:4)
					.streamProportional(indent:'10px', paddingY:'1px', direction:lx.VERTICAL)
				<lx.Box>
					.gridProportional(cols:3, indent:'10px')
					<lx.Button:@butOk>(text:'Далее')
					<lx.Button:@butBack>(text:'Назад')
					<lx.Button:@butClose>(text:'Закрыть')
}
