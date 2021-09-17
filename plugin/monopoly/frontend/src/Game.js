class Game #lx:namespace lxMonopoly {
	constructor() {
		this.isActive = false;
		this.gamers = new lx.Collection();
	}

	newGame() {
		if (this.isActive) {
			Plugin.root->confirmPopup.open('Уверены, что хотите прервать текущую игру')
				.yes(()=>Plugin->>popupNewGame.open());
			return;
		}
		Plugin->>popupNewGame.open();
	}

	newGameProcess(data) {

		console.log(data);

		this.isActive = true;
	}

}
