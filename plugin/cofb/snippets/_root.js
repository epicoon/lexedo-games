/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:script '@site/lib/three.js';

#lx:use lx.Table;

Plugin.title = 'The castles of Burgundy';


// Канвас для 3д-мира
new lx.Box({key:'canvas', geom:true, style:{fill:'#555555'}});


// Кнопка открытия меню создания игры
decorateBox(new lx.Box({
	key: 'butNewGame',	
	geom: [1, 1, 10, 5],
	text: 'Новая игра'
}));


//TODO переделать в полноценное меню
// Кнопка открытия таблицы очков
decorateBox(new lx.Box({
	key: 'butOpenScore',	
	geom: [89, 1, 10, 5],
	text: 'Таблица очков'
}));


// Меню создания игры
Snippet.addSnippet('newGameMenu', {geom:[1, 6, '360px', '300px']});


// Подсказка что делать в данный момент
decorateBox(new lx.Box({
	key: 'lblHint',
	geom: [0.5, 92, 18, 7]
}));


// Сообщение о том, что ход закончился, кликабелен для передачи хода другому игроку
decorateBox((new lx.Box({
	key: 'lblTurnEnds',
	geom: [89, 94, 10, 5],
	text: 'Переход хода'
})).hide());


// Иконка, сопровождающая мышь, показывающая какое сейчас совершается действие
(new lx.Box({
	key: 'statusIcon',
	geom: true,
	size: ['60px', '60px']
})).hide();


// Меню для управления рабочими
Snippet.addSnippet('workerMenu', {geom:true});


// Окошко, показывающее содержимое стопки фишек
var pileContain = new lx.Box({
	key: 'pileContain',
	geom: [89, 8, 8, 'auto']
});
pileContain.add(lx.Rect, {geom:true, style:{fill:'black',opacity:0.7}});
pileContain.add(lx.Box, {geom:true, key:'stream'});
pileContain.hide();


// Отображение заработанных только что очков
var floatPoints = new lx.Box({key:'floatPoints', geom:[0, 0, 0, 0]});
floatPoints.style('overflow', 'hidden');
floatPoints.style('color',  'white');
floatPoints.add(lx.Rect, { geom:true, style: {fill:'black', opacity:0.7} });
var tab = floatPoints.add(lx.Table, {key:'tab', geom:true, cols:1, rows:1});
floatPoints.hide();


// Всплывающая подсказка
var floatHint = new lx.Box({
	key: 'floatHint',
	geom: [0, 0, 0, 0],
	style: {color: 'white', fontSize: '20px'}
});
floatHint.add(lx.Box, {key: 'fon', geom:true, style: { fill:'black', opacity:0.7 }});
floatHint.add(lx.Box, {key: 'val', margin:'10px'});
floatHint.hide();


// Таблица набранных к данному моменту очков
Snippet.addSnippet('scoreTable', {geom:[0, 0, 100, 100]});


// Попап подтверждения решений
Snippet.addSnippet({
	plugin: 'lx/tools:snippets',
	snippet: 'confirmPopup'
});


//======================================================================================================================

Snippet.onload(()=>{#lx:require _rootClient;});

function decorateBox(box) {
	box.align(lx.CENTER, lx.MIDDLE);
	box.addClass('cofbBut');
}
