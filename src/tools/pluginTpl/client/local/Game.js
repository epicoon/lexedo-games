#lx:module <<front_namespace>>.Local;
#lx:module-data {
	i18n: {plugin:<<serviceName>>:<<pluginName>>}/assets/i18n/main.yaml
};

#lx:use lexedo.games.localActions;
#lx:require -R src/;
#lx:require ../GameBehavior;
#lx:require Gamer;

#lx:namespace <<front_namespace>>;
class Game extends lexedo.games.LocalGame {
	#lx:behavior <<front_namespace>>.GameBehavior;

	init(env) {
		//TODO
	}
}
