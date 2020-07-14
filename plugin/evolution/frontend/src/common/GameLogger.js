class GameLogger {
	constructor(game) {
		this.game = game;
		this.messages = new lx.Collection();
	}

	print(text) {
		this.messages.insert(0, {text});
	}
}
