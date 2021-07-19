/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;
#lx:use lx.Input;
#lx:use lx.MultiBox;
#lx:use lx.ActiveBox;

//======================================================================================================================
// Поле для отображения существ
var mainBox = new lx.Box({
	key: 'mainBox',
	geom: [0, 0, 80, 70]
});
var localGameField = mainBox.add(lx.Box, {key:'localGameField', geom:[0, 0, 50, 100]});
var oppGameField = mainBox.add(lx.Box, {key:'oppGameField', geom:[50, 0, 50, 100]});

localGameField.overflow('auto');
var localCreaturesBox = localGameField.add(lx.Box, {key:'localCreaturesBox'});

oppGameField.overflow('auto');
var oppCreaturesBox = oppGameField.add(lx.Box, {key:'oppCreaturesBox'});


//======================================================================================================================
// Панель для отображения карт на руках
var cartsWrapper = new lx.Box({
	geom: [0, null, 80, 30, null, 0]
});
cartsWrapper.overflow('auto');
// TODO css-class
cartsWrapper.border();
cartsWrapper.fill('green');

var cartsBox = cartsWrapper.add(lx.Box, {
	key: 'cartsBox',
	geom: true
});
cartsBox.stream({ indent: '10px', direction: lx.HORIZONTAL });


//======================================================================================================================
// Панель с информацией о текущей игре
var gameInfoBox = new lx.Box({
	geom: [null, 0, 20, null, 0, 0]
});
// TODO css-class
gameInfoBox.border();
gameInfoBox.fill('lightgreen');

gameInfoBox.streamProportional({indent: '10px'});
gameInfoBox.begin();
	var lbl = new lx.Box({height: '40px'});
	lbl.text(#lx:i18n(gamers));
	lbl.align(lx.CENTER, lx.MIDDLE);

	// Список игроков
	var gamersWrapper = new lx.Box({height:1, css:'lx-Box'});
	gamersWrapper.add(lx.Box, {key:'gamersBox', geom:true})
		.stream({indent:'10px'});

	// Чат/лог
	var logWrapper = new lx.Box({height: 2});
	var logs = logWrapper.add(lx.MultiBox, {geom:true, marks:[#lx:i18n(chat), #lx:i18n(log)]});
	var chat = logs.sheet(0).add(lx.Box, {geom:true})
		.streamProportional({step:'10px'});
	chat.add(lx.Input, {key:'chatMessageBox', height:'40px'});
	chatBoxWrapper = chat.add(lx.Box, {height:1});
	chatBoxWrapper.add(lx.Box, {key:'chatBox', geom:true})
		.stream({rowDefaultHeight:'auto'});
	chatBoxWrapper.overflow('auto');
	logs.sheet(1).add(lx.Box, {key:'logBox', geom:true})
		.stream({rowDefaultHeight:'auto'});
	logs.sheet(1).overflow('auto');

	// Текущая фаза
	// Чей ход
	// Подсказка что можно делать
	// Пульт управления в фазе
	var phaseWrapper = new lx.Box({height:2, css:'lx-Box'});
	phaseInfo = phaseWrapper.add(lx.Box, {key:'phaseInfoBox', geom:true});
	phaseInfo.streamProportional({
		direction: lx.VERTICAL,
		indent: '10px'
	});
	phaseInfo.begin();
		(new lx.Box({key:'phaseType', height:'40px'})).align(lx.CENTER, lx.MIDDLE);
		(new lx.Box({key:'phaseCurrentGamer', height:'40px'})).align(lx.LEFT, lx.MIDDLE);
		(new lx.Box({key:'phaseHint', height:'auto'})).align(lx.LEFT, lx.MIDDLE);
		var phaseMenu = new lx.Box({key:'phaseMenu', height:1});
		var phaseGrowMenu = phaseMenu.add(lx.Box, {geom:true, key:'phaseGrowMenu'});
		var phaseFeedMenu = phaseMenu.add(lx.Box, {geom:true, key:'phaseFeedMenu'});
		phaseMenu.getChildren().each(child=>child.hide());
		phaseGrowMenu.add(lx.Button, {size:[100, '40px'], key:'growPassBut', text:#lx:i18n(pass)});
		phaseGrowMenu.align(lx.CENTER, lx.MIDDLE);
		var foodInfoBox = phaseFeedMenu.add(lx.Box, {geom:[0, 0, 100, '40px'], key:'foodInfoBox', text:#lx:i18n(food) + ': 0'});
		foodInfoBox.align(lx.CENTER, lx.MIDDLE);
		phaseFeedMenu.add(lx.Box, {geom:true, key:'foodBut', style:{cursor:'pointer'}});
		phaseFeedMenu.add(lx.Button, {geom:[0, '50px', 100, '40px'], key:'feedEndTurnBut', text:#lx:i18n(endTurn)});
	phaseInfo.end();
gameInfoBox.end();


//======================================================================================================================
// Меню управления картой
var cartMenu = new lx.Box({
	key: 'cartMenu',
	geom: [0,0,0,0]
});
cartMenu.fill('white');
cartMenu.add(lx.Button, {
	key: 'newCreatureBut',
	text: #lx:i18n(creature),
	geom: ['10px', '10px', null, '40px', '10px']
});
cartMenu.add(lx.Button, {
	key: 'newPropertyBut',
	text: #lx:i18n(property),
	geom: ['10px', '60px', null, '40px', '10px']
});
cartMenu.hide();


//======================================================================================================================
// Итог игры
var resultBox = new lx.ActiveBox({	
	key: 'resultBox',
	geom: [20, 25, 60, 30],
	header: #lx:i18n(results)
});
resultBox.setSnippet('resultBox');
resultBox.hide();


//======================================================================================================================
// Отладочный плагин
#lx:mode-case: dev
	#lx:use lx.EggMenu;
	var devMenu = new lx.EggMenu({
		key: 'devMenu',
		coords: [2, 2],
		menuWidget: lx.ActiveBox,
		menuConfig: {size: ['400px', '250px']}
	});
	devMenu.setPlugin('lexedo/games:evolution_Dev');
	Snippet.onLoad(()=>{
		Plugin->>devMenu.getInnerPlugin().environment = Plugin.environment;
	});
#lx:mode-end;
