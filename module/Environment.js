#lx:module lexedo.games;

#lx:use lx.socket.WebSocketClient;

#lx:private;

#lx:require src/;

class Environment #lx:namespace lexedo.games {
	constructor(plugin, config) {
		this._plugin = plugin;
		this._eventCore = new lx.LocalEventSupervisor();		

		plugin.onDestruct(()=>this.destruct());

		this.mode = config.mode || 'prod';
		this.name = config.name || 'Unknown';

		this.useScreenLock = (config.useScreenLock === undefined) ? true : config.useScreenLock;
		this._connector = new Connector(plugin, this, config.game);
	}

	getPlugin() {
		return this._plugin;
	}

	getSocket() {
		return this._connector.socket;
	}

	destruct() {
		this._connector.leave();
	}

	triggerChannelEvent(eventName, data = {}, receivers = null, privateMode = false) {
		this._connector.trigger(eventName, data, receivers, privateMode);
	}

	triggerEvent(eventName, params = []) {
		this._eventCore.trigger(eventName, params);
	}

	subscribeEvent(eventName, callback) {
		this._eventCore.subscribe(eventName, callback);
	}

	onGameStuffed() {
		if (this.useScreenLock) {
			this.screenLock.del();
			delete this.screenLock;
			this.useScreenLock = false;
		}

		this.game.onStuffed();
		this.game.setPending(false);
	}

	onGameBegin(data) {
		this.game.onBegin(data);
	}

	lockScreen() {
		if (this.useScreenLock) {
			this.screenLock = new lx.Box({geom: true});
			this.screenLock.add(lx.Box, {geom: true, style:{fill:'black', opacity:0.5}});
			var textWrapper = this.screenLock.add(lx.Box, {geom:true});
			textWrapper.text('Waiting for players...');
			textWrapper.style('color', 'white');
			textWrapper->text.style('fontSize', '2em');
			textWrapper.align(lx.CENTER, lx.MIDDLE);
		}
	}
}
