#lx:use lx.socket.WebSocketClient;

#lx:namespace lxGames.manage;
class Core extends lx.PluginCore {
	init(plugin) {
		this.socket = null;
		this.commonProcessStatus = new lxGames.manage.CommonProcessStatus(this);
		this.selectedChannelHolder = new lxGames.manage.SelectedChannelHolder(this);
		this.channels = lx.ModelCollection.create({
			schema: {
				gameType: {},
				icon: {},
				channelName: {},
				gameName: {},
				date: {},
				selected: {default: false}
			}
		});

		this.getPlugin().on('commonChannelFound', e => __connectToCommon(this, e.data.connectionData));
		this.getPlugin().on('connectionEstablished', e => __getChannelsData(this));
	}

	run() {
		this.commonProcessStatus.watchOn();
	}
	
	onStop() {
		this.selectedChannelHolder.unselect();
		this.channels.clear();
		this.commonProcessStatus.setPending();
	}
	
	onRestart() {
		this.commonProcessStatus.watchOff();
		this.onStop();
	}

	addChannel(channelData) {
		this.channels.add(channelData);
	}

	removeChannel(channelName) {
		let selector = new lx.CollectionSelector();
		selector.setCollection(this.channels);
		let channel = selector
			.ifPropertyIs('channelName', channelName)
			.getResult()
			.at(0);
		this.channels.remove(channel);
		this.selectedChannelHolder.unselect(channel);
	}
}

function __connectToCommon(self, connectionData) {
	self.socket = new lxGames.manage.WebSocketClient(self, connectionData);
	self.socket.connect({login: lx.app.user.login}, {
		auth: lx.app.storage.get('lxauthtoken'),
		cookie: document.cookie,
		admin: true
	});
}

function __getChannelsData(self) {
	self.socket.request('admin/get-channels-data').then(res=>{
		self.channels.reset(res.channels);
	});
}
