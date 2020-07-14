class ConnectionEventListener #lx:namespace lexedo.games.Evolution extends lexedo.games.ConnectionEventListener {
	onConnected(mates, data) {
		super.onConnected(mates, data);

		this.getEnvironment().dataCatalog = new lexedo.games.Evolution.DataCatalog(data);
		for (let i in mates)
			this.getEnvironment().game.registerGamer(mates[i]);
	}


	onClientJoin(channelMate) {
		super.onClientJoin(channelMate);
		this.getEnvironment().game.registerGamer(channelMate);
	}

	//onClientLeave

}
