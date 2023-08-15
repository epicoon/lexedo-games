#lx:namespace <<front_namespace>>;
class ActionPing extends lexedo.games.actions.RequestAction {
    run() {
        this.getPlugin().trigger('pong', {
            message: this.responseData.response
        });
    }
}
