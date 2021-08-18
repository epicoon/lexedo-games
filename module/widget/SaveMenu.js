#lx:module lexedo.games.SaveMenu;
#lx:module-data {
    i18n: i18n.yaml
};

#lx:use lx.ActiveBox;

class SaveMenu extends lx.ActiveBox #lx:namespace lexedo.games {
    modifyConfigBeforeApply(config) {
    	config.geom = config.geom || [20, 15, 60, 60];
    	config.header = config.header || #lx:i18n(saveMenu);
    	config.closeButton = config.closeButton ?? true;
        return config;
    }

    #lx:client clientBuild(config) {
    	super.clientBuild(config);
    	this.begin();
    	let content = this.renderContent();
    	this.end();

    	this.nameInput = content.nameInput;

		#lx:model-collection gamesList = {
			type,
			name,
			date,
			gamers
		};
		this.gamesList = gamesList;

    	content.filter.on('change', function(event, val) {
    		console.log('Filter was changed', val);
    	});

    	content.actionBut.click(()=>{
	    	this._env.socketRequest('saveGame', {
	    		gameName: this.getGameName()
	    	}).then((res)=>{
	    		lx.Tost('Game has saved');
	    	});
    	});

    	content.list.matrix({
    		items: this.gamesList,
    		itemBox: lx.Box,
    		itemRender: function(box, model) {

    			console.log(box);
    			console.log(model);

    		}
    	});
    }

    #lx:client setEnvironment(env) {
    	this._env = env;
    	this._env.commonSocketRequest('getSavedGames', {
    		gameType: this._env.type
    	}).then((result)=>{
    		console.log(result);

    		this.gamesList.reset(result);
    	});
    }

    getGameName() {
    	return this.nameInput.value();
    }

	#lx:tpl-method renderContent() {
		<lx.Box:._vol>
			.streamProportional(indent:'10px')
			<lx.Box>
				.gridProportional(stepX:'10px')
				<lx.Box>(width:3, text:#lx:i18n(gameName)).align(lx.CENTER, lx.MIDDLE)
				<lx.Input:@nameInput>(width:6)
				<lx.Button:@actionBut>(width:3, text:#lx:i18n(save))
			<lx.RadioGroup:@filter>(cols:3, height:'auto', labels:[
				#lx:i18n(yourSaves),
				#lx:i18n(savesWithYou),
				#lx:i18n(allSaves)
			])
			<lx.Box:@list>(height:8).fill('white')
    }
}
