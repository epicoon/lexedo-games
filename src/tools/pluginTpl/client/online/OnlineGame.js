#lx:module <<front_namespace>>.OnlineGame;
#lx:module-data {
    i18n: {plugin:<<serviceName>>:<<pluginName>>}/assets/i18n/main.yaml
};

#lx:use lexedo.games.onlineActions;
#lx:require -R src/;
#lx:require ../GameBehavior;
#lx:require OnlineGamer;

#lx:namespace <<front_namespace>>;
class OnlineGame extends lexedo.games.OnlineGame {
    #lx:behavior <<front_namespace>>.GameBehavior;

    static getGamerClass() {
        return <<front_namespace>>.OnlineGamer;
    }

    static getChannelEventListenerClass() {
        return lexedo.games.actions.ChannelEventListener;
    }
}
