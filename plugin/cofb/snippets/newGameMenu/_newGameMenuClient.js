/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Box} Snippet
 */

var snippetBox = Snippet.widget;
var firstStep = snippetBox->firstStep;
var secondStep = snippetBox->secondStep;

Snippet.gamersData = [];

snippetBox.open = function() {
	if (this.visibility()) return;
	this->secondStep.hide();
	this->firstStep.show();
	this.show();
	this->>check.each((ch)=>ch.value(false));
};

snippetBox.close = function() {
	if (!this.visibility()) return;
	this.hide();
};


//======================================================================================================================
// firstStep
var gamersList = firstStep->gamersList;
gamersList.begin();
for (var i=0; i<4; i++) {
	var color = new lx.Box({width: 2});
	color.picture(cofb.GAMER_COLOR[i] + '.jpg');
	color.border({color:'gray'});

	var name = new lx.Box({width: 8});
	name.text(cofb.GAMER_NAMES[i]);
	name.align(lx.CENTER, lx.MIDDLE);

	var ch = new lx.Box({width: 2});
	var check = ch.add(lx.Checkbox, {key: 'check'});
	ch.align(lx.CENTER, lx.MIDDLE);
	check.num = i;
}
gamersList.end();

firstStep->>butOk.click(function() {
	Snippet.gamersData = [];
	var checks = firstStep->>check;

	checks.each((a)=>{
		if (a.value()) Snippet.gamersData.push({num:a.num, seq:null, ai:false});
	});

	if (Snippet.gamersData.length < 2) {
		lx.Tost.warning('Выберите минимум двух игроков');
		return;
	}

	__startSequanceMenu();
});
firstStep->>butClose.click(()=>snippetBox.hide());
// firstStep
//======================================================================================================================


//======================================================================================================================
// secondStep
var sequensRecipient = null;

secondStep->>butBack.click(()=>__back());
secondStep->>butClose.click(()=>snippetBox.hide());
secondStep->>cube.click(()=>__genSequens());

secondStep->>butOk.click(()=>{
	var seqReady = true;
	Snippet.gamersData.each((a)=>{
		if (a.seq === null) seqReady = false;
	});
	if (!seqReady) {
		lx.Tost.warning('Сначала нужно определить порядок ходов. Кликните по кубику');
		return;
	}

	var data = Snippet.gamersData;
	Snippet.gamersData = [];
	snippetBox.hide();

	//TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	bgGame.start(data);
});


function __back() {
	secondStep.hide();
	firstStep.show();
}

function __startSequanceMenu() {
	firstStep.hide();
	secondStep.show();
	secondStep->gamersList.clear();
	secondStep->>cube.addClass('pulse');

	Snippet.sequence = new Array(Snippet.gamersData.length);

	Snippet.AIlist = [false, false, false, false];
	for (var i=0; i<Snippet.gamersData.length; i++) {
		var num = Snippet.gamersData[i].num;
		var row = secondStep->gamersList.add(lx.Box);

		row.gridProportional({step:'10px'});
		row.begin();
			var color = new lx.Box({width: 2});
			color.picture(cofb.GAMER_COLOR[num] + '.jpg');
			color.border({color:'gray'});

			var name = new lx.Box({width: 8, text:cofb.GAMER_NAMES[num]});
			name.align(lx.CENTER, lx.MIDDLE);

			var seq = new lx.Box({key:'seq', width:1, text:'?'});
			seq.align(lx.CENTER, lx.MIDDLE);
			seq.setAttribute('title', 'Очередность хода');

			var ch = new lx.Box({width: 1});
			ch.setAttribute('title', 'За игрока будет действовать компьютер');
			var check = ch.add(lx.Checkbox, {key: 'check'});
			ch.align(lx.CENTER, lx.MIDDLE);
			check.gamerDataIndex = i;
			check.on('change', function(){Snippet.gamersData[this.gamerDataIndex].ai = this.value();});
		row.end();
	}

	gamerIndexForGenSequens = 0;
	__setSequensRecipient(0);
}

function __genSequens() {
	var seq = __genSequensProcess();
	secondStep->gamersList.child(sequensRecipient)->seq.text(seq);
	Snippet.gamersData[sequensRecipient].seq = seq;

	if (sequensRecipient == Snippet.gamersData.length - 1) {
		__setSequensRecipient(null);
		secondStep->>cube.removeClass('pulse');
	} else __setSequensRecipient(sequensRecipient + 1);
}

function __genSequensProcess() {
	var rand = lx.Math.randomInteger(1, 6);	

	// Чтобы исключить ситуации, когда поровну борошен кубик
	function checkSame(val) {
		for (var i=0; i<Snippet.gamersData.length; i++)
			if (Snippet.gamersData[i].seq === val)
				return true;
		return false;
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

function __setSequensRecipient(value) {
	if (sequensRecipient !== null)
		secondStep->gamersList.child(sequensRecipient).fill('');
	sequensRecipient = value;
	if (sequensRecipient !== null)
		secondStep->gamersList.child(sequensRecipient).fill('#888888');
}
// secondStep
//======================================================================================================================
