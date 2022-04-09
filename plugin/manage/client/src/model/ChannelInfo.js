#lx:namespace lexedo.games.manage;
class ChannelInfo extends lx.BindableModel {
    #lx:schema
        date,
        type,
        key,
        name,
        icon: {default: ''};
        // creator;

    set(channel) {
        this.type = channel.type;
        this.icon = channel.icon;
        this.name = channel.name;
    }
}
