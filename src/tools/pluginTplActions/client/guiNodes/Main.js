#lx:namespace <<front_namespace>>.gui;
class Main extends lexedo.games.GuiNode {
    init() {

    }

    initHandlers() {
        this.getElem('but').click(()=>{
            this.getGame().actions.trigger(new <<front_namespace>>.ActionPing());
        });
    }

    subscribeEvents() {
        this.getPlugin().on('pong', event => {
            const box = this.getElem('response');
            box.text(event.getData().message);
            setTimeout(()=>{
                box.text('');
            }, 600);
        });
    }
}
