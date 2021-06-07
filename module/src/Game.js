class Game #lx:namespace lexedo.games {
	constructor(plugin, env) {
		this._plugin = plugin;
		this._environment = env;
		this._pending = true;

		this.init();
	}

	init() {
		// abstract		
	}

	onStuffed() {
		// abstract
	}

	onBegin(data) {
		// abstract
	}

	onGamerReconnected(data) {
		// abstract
	}

	getPlugin() {
		return this._plugin;
	}

	getEnvironment() {
		return this._environment;
	}

	isPending() {
		return this._pending;
	}

	setPending(value) {
		this._pending = value;
	}
}
