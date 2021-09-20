#lx:module lexedo.games.SaveMenu;
#lx:module-data {
    i18n: i18n.yaml
};

#lx:use lx.ActiveBox;
#lx:use lx.Image;

#lx:private;

class SaveMenu extends lx.ActiveBox #lx:namespace lexedo.games {
    modifyConfigBeforeApply(config) {
    	config.geom = config.geom || [10, 15, 80, 60];
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
			image,
			name,
			date,
			gamers,
			isActive: {default: false}
		};
		this.gamesList = gamesList;
		this.activeSave = null;

    	content.filter.on('change', function(event, val) {

    		//TODO фильтровать список игр
    		console.log('Filter was changed', val);
    	});

    	content.list.matrix({
    		items: this.gamesList,
    		itemBox: [lx.Box, {height:'60px', gridProportional: {indent:'10px'}}],
    		itemRender: (box, model)=>{
    			let imgWrapper = new lx.Box({css:'lx-Box'});
    			let img = imgWrapper.add(lx.Image, {filename: model.image});
    			img.adapt();

    			new lx.Box({field:'name', width:3, css:'lx-Box'});
    			new lx.Box({field:'date', width:3, css:'lx-Box'});
    			new lx.Box({field:'gamers', width:5, css:'lx-Box'});

    			box.getChildren().forEach(c=>c.align(lx.CENTER, lx.MIDDLE));
    			box.style('cursor', 'pointer');
    			box.click(()=>__setActiveSave(this, model));
    			box.setField('isActive', function(value) {
					this.fill(value ? 'lightgreen' : ''); 
    			});
    		}
    	});
    }

    #lx:client setEnvironment(env) {
    	let actionBut = this->>actionBut;
    	actionBut.text(#lx:i18n(save))
    	actionBut.click(()=>{
    		let gameName = this.getGameName();
    		if (gameName == '') {
    			lx.Tost.warning(#lx:i18n(needGameName));
    			return;
    		}

	    	this._env.socketRequest('saveGame', {gameName}).then((res)=>{
	    		lx.Tost('Game has saved');
	    		__unsetActiveSave(this);
	    		//TODO this.gamesList.reset()
	    	});
    	});

    	this._env = env;
    	this._env.commonSocketRequest('getSavedGames', {
    		gameType: this._env.type
    	}).then(result=>{
    		this.gamesList.reset(result);
    	});
    }

    #lx:client setCore(core) {
    	let actionBut = this->>actionBut;
    	actionBut.text(#lx:i18n(load))
    	actionBut.click(()=>{
    		let gameName = this.getGameName();
    		if (gameName == '' || !this.activeSave) {
    			lx.Tost.warning(#lx:i18n(needGameName));
    			return;
    		}

    		//TODO password!!
			this._core.__inConnecting = {
				password: ''
			};
			this._core.socket.trigger('loadGame', {
				type: this.activeSave.type,
				name: this.activeSave.name
			});
			this.del();
    	});

    	this._core = core;
    	this._core.socket.request('getSavedGames').then(result=>{
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
				<lx.Button:@actionBut>(width:3)
			<lx.RadioGroup:@filter>(cols:3, height:'auto', labels:[
				#lx:i18n(yourSaves),
				#lx:i18n(savesWithYou),
				#lx:i18n(allSaves)
			])
			<lx.Box>(height:8).fill('white')
				<lx.Box:@list>
					.stream(direction:lx.VERTICAL, indent:'10px')
    }
}


function __setActiveSave(self, model) {
	if (self.activeSave) self.activeSave.isActive = false;
	self.activeSave = model;
    self.nameInput.value(model.name);
    model.isActive = true;
}

function __unsetActiveSave(self) {
	if (self.activeSave) self.activeSave.isActive = false;
	self.activeSave = null;
	self.nameInput.value('');
}
