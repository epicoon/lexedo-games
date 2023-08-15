#lx:use lx.Form;
#lx:use lx.Image;

#lx:namespace lxGames.manage.gui;
class ChannelInfoBox extends lx.GuiNode {
    init() {
        this.blank = #lx:model {
            gameType: {default: 'none'},
            icon: {default: ''},
            channelName: {default: 'none'},
            gameName: {default: 'none'},
            date: {default: 'none'}
        };

        const core = this.getCore();
        const widget = this.getWidget();

        widget.bind(this.blank);

        widget->>gameType.setEllipsisHint({css: 'lgman-Hint'});
        widget->>gameName.setEllipsisHint({css: 'lgman-Hint'});
        widget->>channelName.setEllipsisHint({css: 'lgman-Hint'});
        widget->>date.setEllipsisHint({css: 'lgman-Hint'});

        widget->>gameIcon.overflow('hidden');
        widget->>gameIcon.setField('icon', function(val) {
            this.clear();
            if (val == '') return;
            this.add(lx.Image, {src: val}).adapt();
        });

        widget->>connectionsList.matrix({
            items: core.selectedChannelHolder.connections,
            itemBox: [lx.Form, {css:'lgman-smalltext', grid:{indent:'10px', cols:20}}],
            itemRender: function(form, model) {
                form.fields({
                    userId: lx.Box,
                    userAuthValue: [lx.Box, {width:5}],
                    connectionId: [lx.Box, {width:8}],
                    type: [lx.Box, {width:3}],
                    date: [lx.Box, {width:3}],
                });
                form.getChildren().forEach(c=>c.addClass('lga-Box').align(lx.CENTER, lx.MIDDLE));
            }
        });

        widget->>channelData.setLeafRenderer(leaf => {
            let data = leaf.node.data;
            let label = data.name + ' {' + data.type + '}';
            if (data.value !== undefined && data.value !== null) label += ' = ' + data.value;
            leaf->label.text(label);
        });
    }

    initHandlers() {

    }

    subscribeEvents() {
        const plugin = this.getPlugin();
        const core = this.getCore();
        const widget = this.getWidget();

        plugin.on('channelSelected', ()=>{
            widget.bind(core.selectedChannelHolder.channel);
        });
        plugin.on('channelUnselected', ()=>{
            widget.bind(this.blank);
            widget->>channelData.dropTree();
        });
        plugin.on('channelDataUpdated', (event)=>{
            let tree = (new lx.RecursiveTreeConverter().objectToTree(event.getData().channelData));
            widget->>channelData.setTree(tree);
        });
    }
}
