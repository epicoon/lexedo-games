cofb.EventSupervisor.subscribe('cofb_game_over', function(gamer) {
	Plugin->confirmPopup.open('Игра окончена. Хотите посмотреть таблицу очков?', ()=>{
		Plugin->scoreTable.open();
	});
});

const snippetBox = Snippet.widget;
const bodyBox = Snippet->>body;

Plugin->butOpenScore.click(()=>snippetBox.open());
Snippet->>closeBut.click(()=>snippetBox.close());

snippetBox.open = function() {
	bodyBox.clear();
	for (var i in bgGame.gamers)
		__addGamerInfoBox(bgGame.gamers[i]);

	this.show();
};

snippetBox.close = function() {
	this.hide();
	bodyBox.clear();
};

function __addGamerInfoBox(gamer) {
	var box = new lx.Box({parent: bodyBox});
	box.useRenderCache();
	new lx.Rect({parent:box, geom:true, style:{fill:'black', opacity:0.5}});

	var mainBox = new lx.Box({parent:box, geom:true});
	mainBox.streamProportional({indent:'10px'});

	var headerWrapper = new lx.Box({parent:mainBox, height:'50px'});
	new lx.Rect({parent:headerWrapper, geom:true, style:{fill:'black', opacity:0.5}});
	var header = new lx.Box({parent:headerWrapper, geom:true});
	new lx.Box({parent:header, size:['30px', '30px'], picture:cofb.GAMER_COLOR[gamer.id] + '.jpg'});

	var body = new lx.Box({parent:mainBox});
	body.overflow('auto');
	var grid = new lx.Box({parent:body, geom:[0, 0, '100%', 'auto']});
	grid.grid({step:'10px', minHeight:'50px'});

	var points = 0;
	for (var i=0; i<gamer.pointsInfo.length; i++) {
		var info = gamer.pointsInfo[i],
			text,
			amt = info.amt;

		switch (info.cod) {
			case SCORE_ANIMAL : {
				var arr = info.info.split('.'),
					name = ['коровы', 'куры', 'овцы', 'свиньи'];
				text = 'Размещены животные: ' + name[arr[0]] + ', ' + arr[1] + ' шт';
			} break;
			case SCORE_GOODS : text = 'Проданы товары: ' + info.info + ' шт'; break;
			case SCORE_TOWER : text = 'Размещена сторожевая башня'; break;
			case SCORE_FILL : text = 'Заполнена область размером ' + info.info + ' ячеек'; break;
			case SCORE_FILLBONUS : text = 'Бонус фазы игры (' + info.info + ') за заполнение области'; break;
			case SCORE_WORKER : text = 'Осталось рабочих: ' + info.info; break;
			case SCORE_SILVER : text = 'Заработанное серебро'; break;
			case SCORE_LOSTGOODS : text = 'Не проданные товары'; break;
			case SCORE_BONUS : {
				text = 'Бонус за полное заполнение одного цвета';
			} break;
			case SCORE_KNOWELEGE : {
				switch (info.info) {
					case VARIANT_KNOWLEDGE_15 : text = 'Знание: 3 очка за каждый тип проданных товаров'; break;
					case VARIANT_KNOWLEDGE_16 : text = 'Знание: 4 очка за каждый склад'; break;
					case VARIANT_KNOWLEDGE_17 : text = 'Знание: 4 очка за каждую сторожевую башню'; break;
					case VARIANT_KNOWLEDGE_18 : text = 'Знание: 4 очка за каждую лесопилку'; break;
					case VARIANT_KNOWLEDGE_19 : text = 'Знание: 4 очка за каждый храм'; break;
					case VARIANT_KNOWLEDGE_20 : text = 'Знание: 4 очка за каждый рынок'; break;
					case VARIANT_KNOWLEDGE_21 : text = 'Знание: 4 очка за каждую гостиницу'; break;
					case VARIANT_KNOWLEDGE_22 : text = 'Знание: 4 очка за каждый банк'; break;
					case VARIANT_KNOWLEDGE_23 : text = 'Знание: 4 очка за каждую ратушу'; break;
					case VARIANT_KNOWLEDGE_24 : text = 'Знание: 4 очка за каждый тип животных'; break;
					case VARIANT_KNOWLEDGE_25 : text = 'Знание: 1 очко за каждый проданный товар'; break;
					case VARIANT_KNOWLEDGE_26 : text = 'Знание: 2 очка за каждый жетон бонуса'; break;
				}
			} break;
		}

		points += amt;
		__addBox(grid, text, 10, lx.LEFT);
		__addBox(grid, amt, 2, lx.CENTER);
	}

	header.style('color', 'white');
	header.text(gamer.getName() + ': ' + points);
	header.align({
		horizontal: lx.LEFT,
		vertical: lx.MIDDLE,
		indent: '10px'
	});

	box.applyRenderCache();
}

function __addBox(parent, text, width, hor) {
	var box = new lx.Box({parent, width});
	new lx.Rect({parent:box, geom:true, style:{fill:'black', opacity:0.5}});
	box.style('color', 'white');
	var txt = new lx.Box({parent:box, geom:true});
	txt.text(text);
	txt.align(hor, lx.MIDDLE);
}
