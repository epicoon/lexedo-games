#lx:namespace <<front_namespace>>.localServer;
class ActionPing extends lexedo.games.actions.ResponseAction {
    run() {
        this.outputData.add('response', 'Pong');
    }
}
