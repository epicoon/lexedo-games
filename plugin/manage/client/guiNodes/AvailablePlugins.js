#lx:use lx.StreamItemRelocator;
#lx:use lx.Checkbox;

#lx:namespace lxGames.manage.gui;
class AvailablePlugins extends lx.GuiNode {
    show() {
        ^Respondent.getGamePlugins().then(res=>{
            this.gamePlugins.reset(res.data);
        });
        super.show();
    }

    init() {
        const saveBut = this.getWidget()->>saveBut;
        saveBut.disabled(true);

        this.gamePlugins = lx.ModelCollection.create({
            schema: [
                'name',
                'isActive'
            ]
        });
        let stream = this.getWidget()->>stream;
        stream.matrix({
            items: this.gamePlugins,
            itemBox: [ lx.Box, {grid:{indent:'10px'}, css:'lgman-Box'} ],
            itemRender: (form, model)=>{
                let rel = form.add(lx.StreamItemRelocator, {text:'&#10022;', width: 1});
                rel.style('fontSize', '1.5em');
                rel.style('cursor', 'move');
                rel.align(lx.CENTER, lx.MIDDLE);
                rel.on('afterStreamItemRelocation', ()=>saveBut.disabled(false));

                let name = form.add(lx.Box, {field:'name', width: 9});
                name.align(lx.CENTER, lx.MIDDLE);

                let isActive = form.add(lx.Box, {width: 2});
                let check = isActive.add(lx.Checkbox, {field:'isActive'});
                isActive.align(lx.CENTER, lx.MIDDLE);
                check.on('change', ()=>saveBut.disabled(false));
            }
        });
    }

    initHandlers() {
        const saveBut = this.getWidget()->>saveBut;
        saveBut.click(()=>{
            let sorting = 1,
                list = [];
            this.gamePlugins.forEach(gamePlugin=>{
                list.push({
                    name: gamePlugin.name,
                    isActive: gamePlugin.isActive,
                    sorting: sorting++
                });
            });
            ^Respondent.saveGamePlugins(list).then(res=>{
                saveBut.disabled(true);
            });
        });
    }
}
