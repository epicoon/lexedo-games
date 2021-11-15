class GameChat #lx:namespace lexedo.games.Evolution {
	constructor(game) {
		this.game = game;
		this.messages = new lx.Collection();
	}

	send(text) {
		this.game.getEnvironment().triggerChannelEvent('chat-message', {text});
	}

	receive(event) {
		this.messages.insert(0, {
			from: this.game.getGamerByChannelMate(event.getAuthor()),
			text: event.getData().text
		});
	}
}
