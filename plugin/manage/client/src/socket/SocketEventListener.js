#lx:namespace lxGames.manage;
class SocketEventListener extends lx.socket.EventListener {
	constructor(core) {
		super();
		this.core = core;
	}

	onGameChannelCreated(event) {
		this.core.addChannel(event.getData());
	}

	onGameChannelDropped(event) {
		this.core.removeChannel(event.getData().channelName);
	}

	onNewGameChannelConnection(event) {
		this.core.selectedChannelHolder.addConnection(event.getData());
	}

	onDropGameChannelConnection(event) {
		this.core.selectedChannelHolder.removeConnection(event.getData().connectionId);
	}
}
