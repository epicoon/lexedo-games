let game = Plugin.instances.game;

const Form = Snippet.widget.parent;

Form.open = function() {
	this.show();
}

Snippet->>gamersAmount.on('change', (e, val)=>{
	onSelectGamersAmount(val);
});
onSelectGamersAmount(0);


Snippet->>gamers.matrix({
	items: game.gamers,
	itemBox: [lx.Form, {grid:{indent:'10px'}}],
	itemRender: function(form) {
		form.field('name', lx.Input, {width: 4});

		var color = new lx.Box({ width: 2 });
		color.setField('color', (val)=>color.fill(val));

		var options = new Array(Snippet->>gamersAmount.value() + 2);
		options.each((a, i)=>options[i]=i+1);
		form.field('team', lx.Dropbox, {width: 3, options});

		var comp = new lx.Box({width: 3});
		comp.add(lx.Checkbox, {field: 'isComputer'});
		comp.align(lx.CENTER, lx.MIDDLE);
	}
});


function onSelectGamersAmount(amount) {
	game.gamers.clear();
	for (var i=0; i<amount+2; i++) {
		game.gamers.add( new lxMonopoly.Gamer(lxMonopoly.Gamer.defaultList[i]) );
	}
}
