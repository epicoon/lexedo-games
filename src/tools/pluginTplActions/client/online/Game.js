#lx:module <<front_namespace>>.Online;
#lx:module-data {
    i18n: {plugin:<<serviceName>>:<<pluginName>>}/assets/i18n/main.yaml
};

#lx:use lexedo.games.onlineActions;
#lx:require -R src/;
#lx:require ../GameBehavior;
#lx:require Gamer;

#lx:namespace <<front_namespace>>;
class Game extends lexedo.games.Game {
    #lx:behavior <<front_namespace>>.GameBehavior;

    static getGamerClass() {
        return <<front_namespace>>.Gamer;
    }

    static getChannelEventListenerClass() {
        return lexedo.games.actions.ChannelEventListener;
    }
}
