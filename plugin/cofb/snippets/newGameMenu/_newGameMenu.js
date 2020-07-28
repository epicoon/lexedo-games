/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Box} Snippet
 */

#lx:use lx.Button;
#lx:use lx.Checkbox;

Snippet.onLoad(()=>{#lx:require _newGameMenuClient;});
var snippetBox = Snippet.widget;

snippetBox.fill('black');
snippetBox.style('color', 'white');
snippetBox.hide();

var firstStep = new lx.Box({key:'firstStep', geom:true});
var secondStep = new lx.Box({key:'secondStep', geom:true});

firstStep.streamProportional();
firstStep.begin();
	(new lx.Box({text:'Игроки'})).align(lx.CENTER, lx.MIDDLE);

	var list = new lx.Box({key:'gamersList', height:4});
	list.gridProportional({indent:'10px', paddingY:'1px'});

	var pult = new lx.Box();
	pult.gridProportional({cols:2, indent:'10px'});
	pult.add(lx.Button, {key:'butOk', text:'Далее'});
	pult.add(lx.Button, {key:'butClose', text:'Закрыть'});
firstStep.end();

secondStep.streamProportional();
secondStep.begin();
	var wrapper = new lx.Box();
	var head = wrapper.add(lx.Box, {geom:true});
	head.gridProportional({indent:'10px'});
	(new lx.Box({parent:head, width:10, text:'Порядок хода'})).align(lx.CENTER, lx.MIDDLE);
	var cubeWrapper = new lx.Box({parent:head, width:1});
	cubeWrapper.overflow('visible');
	var cube = cubeWrapper.add(lx.Box, {key:'cube', geom:[0, 0, 100, 100], picture:'cube.png'});
	cube.style('cursor', 'pointer');
	cube.setAttribute('title', 'Нажмите, чтобы определить очередность хода');

	var comp = new lx.Box({parent:head, width:1, picture:'comp.png'});
	comp.setAttribute('title', 'За игрока будет действовать компьютер');

	var list = new lx.Box({key:'gamersList', height:4});
	list.streamProportional({indent:'10px', paddingY:'1px', direction:lx.VERTICAL});

	var pult = new lx.Box();
	pult.gridProportional({cols:3, indent:'10px'});
	pult.add(lx.Button, {key:'butOk', text:'Далее'});
	pult.add(lx.Button, {key:'butBack', text:'Назад'});
	pult.add(lx.Button, {key:'butClose', text:'Закрыть'});
secondStep.end();
