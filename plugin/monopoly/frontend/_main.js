/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Box} Snippet
 */

#lx:require -R src/;

let dataProvider = Plugin.instances.dataProvider;
dataProvider = new lxMonopoly.DataProvider();
dataProvider.loadData();

Plugin.instances.game = new lxMonopoly.Game();
let game = Plugin.instances.game;

const gameBox = Plugin->main.child(0);
gameBox.getChildren().forEach((box)=>{
	if (box.key[0] != 'c') return;

	var image = box->>image;	
	if (!(image instanceof lx.Rect)) return;
	image.click(()=>{
		var company = dataProvider.getCompany(box.key);
		if (company.isGrouped()) Plugin->>popupCompanyInfo.open(company);
	});
});

const gamePult = Plugin->>gamePult;
// gamePult->butAllLog.click();
// gamePult->butSave.click();
// gamePult->butLoad.click();
gamePult->butNewGame.click(()=>game.newGame());

Plugin.root->main.hide();
Plugin->>popupNewGame.show();
