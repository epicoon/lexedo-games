#lx:use lexedo.games;

class Plugin extends lx.Plugin {
    run() {
        this.environment = new lexedo.games.Environment(this, {
            mode: 'dev',
            name: '<<title>>',
            game: {
                local: {module: '<<front_namespace>>.LocalGame'},
                online: {module: '<<front_namespace>>.OnlineGame'},
            }
        });
    }
}
