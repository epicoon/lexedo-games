#lx:namespace lexedo.games.actions;
class Actions {
    constructor(game) {
        this.game = game;

        let dep = this.game.constructor.getActionsDependencies(),
            dataProviderClass = dep.dataProviderClass
                || (game.isLocal() ? lexedo.games.actions.LocalDataProvider : lexedo.games.actions.OnlineDataProvider),
            actionHandlerClass = dep.actionHandlerClass || lexedo.games.actions.ActionHandler;
        this.dataProvider = new dataProviderClass(this);
        this.actionHandler = new actionHandlerClass(this);
    }

    get requestActionsNamespace() {
        return this.game.constructor.getActionsDependencies().requestActionsNamespace;
    }

    get responseActionsNamespace() {
        return this.game.constructor.getActionsDependencies().responseActionsNamespace;
    }

    trigger(action) {
        this.dataProvider.onClientAction(action);
    }
}
