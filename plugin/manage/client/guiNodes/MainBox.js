#lx:use lx.Image;

#lx:namespace lxGames.manage.gui;
class MainBox extends lx.GuiNode {
    init() {
        const core = this.getCore();
        const widget = this.getWidget();
        const channelsList = widget->>channelsList;
        const processBox = widget->>processBox;
        const connectionsList = widget->>connectionsList;
        const processRefreshIndicator = widget->>processRefreshIndicator;

        channelsList.matrix({
            items: core.channels,
            itemBox: [lx.Box, {grid:{indent:'10px'}}],
            itemRender: function(box, model) {
                let icon = new lx.Box({key: 'iconWrapper', css: 'lgman-Box'});
                icon.align(lx.CENTER, lx.MIDDLE);
                icon.setField('icon', function(val) {
                    if (!val) return;
                    this.clear();
                    var img = this.add(lx.Image, {src: val});
                    img.adapt();
                });

                (new lx.Box({
                    field: 'gameName',
                    width: 11,
                    css: 'lgman-Box'
                })).align(lx.CENTER, lx.MIDDLE);

                box.setField('selected', function(val) {
                    if (val) {
                        this->gameName.addClass('lgman-selected-channel');
                        this->iconWrapper.addClass('lgman-selected-channel');
                    } else {
                        this->gameName.removeClass('lgman-selected-channel');
                        this->iconWrapper.removeClass('lgman-selected-channel');
                    }
                });
                box.click(()=>core.selectedChannelHolder.select(model));
            }
        });

        processRefreshIndicator.setField('status', function (val) {
            this.removeClass('lgman-indicator-on');
            this.removeClass('lgman-indicator-pending');
            this.removeClass('lgman-indicator-off');
            switch (val) {
                case lxGames.manage.CommonProcessStatus.ACTIVE:
                    this.addClass('lgman-indicator-on');
                    break;
                case lxGames.manage.CommonProcessStatus.PENDING:
                    this.addClass('lgman-indicator-pending');
                    break;
                case lxGames.manage.CommonProcessStatus.CLOSED:
                case lxGames.manage.CommonProcessStatus.CRASHED:
                    this.addClass('lgman-indicator-off');
                    break;
            }
        });
        processBox.bind(core.commonProcessStatus);
    }

    initHandlers() {
        const widget = this.getWidget();

        widget->>availablePluginsBut.click(()=>{
            this.getGuiNode('availablePlugins').show();
        });

        widget->>processRestart.click(()=>{
            this.getCore().onRestart();
            ^Respondent.rerunCommonProcess().then(res=>{
                if (!res.success) {
                    console.log(res);
                    return;
                }
                setTimeout(()=>this.getCore().commonProcessStatus.watchOn(), 800);
            });
        });

        widget->>processStop.click(()=>{
            this.getCore().onStop();
            ^Respondent.stopCommonProcess().then(res=>{
                if (!res.success) {
                    console.log(res);
                    return;
                }
                setTimeout(()=>this.getCore().commonProcessStatus.watchOn(), 800);
            });
        });
    }

    subscribeEvents() {

    }
}
