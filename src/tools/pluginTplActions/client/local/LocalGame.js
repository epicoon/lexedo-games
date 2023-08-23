#lx:module <<front_namespace>>.LocalGame;
#lx:module-data {
	i18n: {plugin:<<serviceName>>:<<pluginName>>}/assets/i18n/main.yaml
};

#lx:use lexedo.games.localActions;
#lx:require -R src/;
#lx:require ../GameBehavior;
#lx:require LocalGamer;

#lx:namespace <<front_namespace>>;
class LocalGame extends lexedo.games.LocalGame {
	#lx:behavior <<front_namespace>>.GameBehavior;

	init(env) {
		//TODO
	}
}
