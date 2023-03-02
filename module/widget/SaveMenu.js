#lx:module lexedo.games.SaveMenu;
#lx:module-data {
    i18n: i18n.yaml
};

#lx:use lx.ActiveBox;
#lx:use lx.Image;

#lx:namespace lexedo.games;
class SaveMenu extends lx.Box {
    modifyConfigBeforeApply(config) {
		config.geom = config.geom || [10, 15, 80, 60];
		config.header = config.header || #lx:i18n(saveMenu);
    	config.closeButton = config.closeButton || {
			click: function() {
				this.getActiveBox().parent.del();
			}
		};
		config = {
			geom: true,
			depthCluster: lx.DepthClusterMap.CLUSTER_OVER,
			formConfig: config
		};
        return config;
    }

	static initCss(css) {
		css.inheritClass('lgames-Box', 'AbstractBox');
		css.addClass('lgames-saved-games-list', {
			backgroundColor: css.preset.bodyBackgroundColor,
		});
		css.addClass('lgames-save-game-checked', {
			backgroundColor: css.preset.checkedMainColor,
		});
	}
	
    #lx:client clientBuild(config) {
    	super.clientBuild(config);

		this.add(lx.Box, {
			geom: true,
			opacity: 0.5,
			fill: 'black',
			click: ()=>this.del()
		});
		const form = this.add(lx.ActiveBox, config.formConfig);

		form.begin();
    	let content = this.renderContent();
		form.end();

		this._core = null;
		this._env = null;
    	this.nameInput = content.nameInput;

		this.gamesList = lx.ModelCollection.create({
			schema: {
				type: {},
				image: {},
				name: {},
				date: {},
				gamers: {},
				isActive: {default: false}
			}
		});
		this.activeSave = null;

    	content.filter.on('change', function(e) {

    		//TODO фильтровать список игр
    		console.log('Filter has changed', e.newValue);
    	});

    	content.list.matrix({
    		items: this.gamesList,
    		itemBox: [lx.Box, {height:'60px', gridProportional: {indent:'10px'}}],
    		itemRender: (box, model)=>{
    			let imgWrapper = new lx.Box({css:'lgames-Box'});
    			let img = imgWrapper.add(lx.Image, {filename: model.image});
    			img.adapt();

    			new lx.Box({field:'name', width:3, css:'lgames-Box'});
    			new lx.Box({field:'date', width:3, css:'lgames-Box'});
    			new lx.Box({field:'gamers', width:5, css:'lgames-Box'});

    			box.getChildren().forEach(c=>c.align(lx.CENTER, lx.MIDDLE));
    			box.style('cursor', 'pointer');
    			box.click(()=>__setActiveSave(this, model));
    			box.setField('isActive', function(value) {
					this.toggleClassOnCondition(value, 'lgames-save-game-checked');
    			});
    		}
    	});
    }

    #lx:client setEnvironment(env) {
		this._env = env;
		this._env.commonSocketRequest('getSavedGames', {
			gameType: this._env.type
		}).then(result=>this.gamesList.reset(result));

    	const actionBut = this->>actionBut;
    	actionBut.text(#lx:i18n(save));
    	actionBut.click(()=>{
    		let gameName = this.getGameName();
    		if (gameName == '') {
    			lx.tostWarning(#lx:i18n(needGameName));
    			return;
    		}

	    	this._env.socketRequest('saveGame', {gameName}).then(res=>{
	    		lx.tostMessage(#lx:i18n(gameSaved));
	    		__unsetActiveSave(this);
	    		//TODO this.gamesList.reset()
	    	});
    	});
    }

    #lx:client setCore(core) {
		this._core = core;
		this._core.socket.request('getSavedGames').then(result=>this.gamesList.reset(result));

    	let actionBut = this->>actionBut;
    	actionBut.text(#lx:i18n(load));
    	actionBut.click(()=>{
    		let gameName = this.getGameName();
    		if (gameName == '' || !this.activeSave) {
    			lx.tostWarning(#lx:i18n(needGameName));
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
    }

    getGameName() {
    	return this.nameInput.value();
    }

	#lx:tpl-method renderContent() {
		<lx.Box:._spread>
			.streamProportional(indent:'10px')
			<lx.Box>
				.gridProportional(stepX:'10px')
				<lx.Box (width:3, text:#lx:i18n(gameName))>.align(lx.CENTER, lx.MIDDLE)
				<lx.Input:@nameInput (width:6)>
				<lx.Button:@actionBut (width:3)>
			<lx.RadioGroup:@filter
				(cols:3, height:'auto', labels:[
					#lx:i18n(yourSaves),
					#lx:i18n(savesWithYou),
					#lx:i18n(allSaves)
				])
			>
			<lx.Box:.lgames-saved-games-list (height:8)>
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
