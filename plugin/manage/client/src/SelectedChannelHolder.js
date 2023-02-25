#lx:namespace lxGames.manage;
class SelectedChannelHolder {
    constructor(core) {
        this.core = core;

        this.channel = null;
        this.connections = lx.ModelCollection.create({
            schema: [
                'userId',
                'userAuthValue',
                'connectionId',
                'type', // gamer, observer
                'date'
            ]
        });
    }

    select(channel) {
        this.unselect();
        this.channel = channel;
        this.channel.selected = true;
        this.core.socket.request('admin/watchChannel', {channelName: this.channel.channelName}).then(res=>{
            this.connections.reset(res.connections);
            this.core.getPlugin().trigger('channelSelected');
            this.core.getPlugin().trigger('channelDataUpdated', {
                channelData: res.channel
            });
        });
    }

    unselect(channel = null) {
        if (!this.channel) return;
        if (channel === null) channel = this.channel;
        if (channel !== this.channel) return;

        this.channel.selected = false;
        this.channel = null;
        this.connections.clear();
        this.core.getPlugin().trigger('channelUnselected');
    }

    getChannel() {
        return this.channel;
    }

    addConnection(connectionData) {
        this.connections.add(connectionData);
    }

    removeConnection(connectionId) {
        let selector = new lx.CollectionSelector();
        selector.setCollection(this.connections);
        let connection = selector
            .ifPropertyIs('connectionId', connectionId)
            .getResult()
            .at(0);
        this.connections.remove(connection);
    }
}
