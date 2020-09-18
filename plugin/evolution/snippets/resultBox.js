/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;


var box = new lx.Box({geom:true});
box.streamProportional({indent: '10px'});
box.begin();
	var resultMatrix = new lx.Box({key:'resultMatrix'});
	var buts = new lx.Box({height:'40px'});
box.end();

resultMatrix.stream({direction:lx.VERTICAL});
resultMatrix.overflow('auto');

buts.gridProportional({step:'10px', cols:2});
buts.begin();
	new lx.Button({key:'butRestart', text:#lx:i18n(revenge)});
	new lx.Button({key:'butExit', text:#lx:i18n(close)});
buts.end();


Snippet.onLoad(()=>{
	#lx:model-collection results = {
		gamer,
		score,
		dropping
	};

	let resultMatrix = Snippet->>resultMatrix;
	resultMatrix.getEnvironment = function() {
		return this.env;
	};
	resultMatrix.showResult = function(result) {
		results.reset(result);
		Snippet->>butRestart.text(#lx:i18n(revenge));
		Snippet->>butRestart.disabled(false);
		Plugin->>resultBox.show();
	};
	resultMatrix.matrix({
		items: results,
		itemBox: [lx.Box, {grid:{indent:'10px'}}],
		itemRender: function(box, model) {
			let gamer = resultMatrix.getEnvironment().game.getGamerById(model.gamer);
			(new lx.Box({width:8, text:gamer.getName()})).align(lx.CENTER, lx.MIDDLE);
			(new lx.Box({width:4, text:model.score + ' (' + model.dropping + ')'})).align(lx.CENTER, lx.MIDDLE);
		}
	});

	Snippet->>butRestart.click(()=>{
		let env = resultMatrix.getEnvironment();
		env.triggerChannelEvent('approve-revenge', {gamer: env.game.getLocalGamer().getId()});
	});

	Snippet->>butExit.click(()=>{
		Plugin.root.parent.del();
	});
});
