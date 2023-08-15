#lx:use lexedo.games;
#lx:require -R src/;

#lx:namespace <<front_namespace>>;
class GameBehavior extends lx.Behavior {
    behaviorConstructor() {
        //TODO
    }

    static getActionsDependencies() {
        return {
            requestActionsNamespace: '<<front_namespace>>',
            responseActionsNamespace: '<<front_namespace>>.localServer'
        };
    }
}
