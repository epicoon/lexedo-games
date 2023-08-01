#lx:namespace lexedo.games.actions;
class ResponseAction {
    constructor(dataProvider, data) {
        this.dataProvider = dataProvider;
        this.game = dataProvider.game;
        this.inputData = data;
        this.outputData = new lexedo.games.actions.ActionData(this.dataProvider);
    }
    
    run() {
        // abstract
    }

    genSubAction(name, data = {}) {
        let actionName = this.game.actions.responseActionsNamespace + '.' + name,
            actionClass = lx.getClassConstructor(actionName),
            actionObj = new actionClass(this.dataProvider, data);
        actionObj.run();
        this.outputData.merge(name, actionObj.outputData);
    }
}
