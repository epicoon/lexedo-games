#lx:namespace lexedo.games.actions;
class ChannelEventListener extends lexedo.games.ChannelEventListener {
    onError(event) {
        lx.tostError(event.getData().message);
    }

    onAction(event) {
        this.getGame().actions.dataProvider.onServerAction(event.getData());
    }
}
