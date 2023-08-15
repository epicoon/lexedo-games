#lx:use lexedo.games;

class Plugin extends lx.Plugin {
    run() {
        this.environment = new lexedo.games.Environment(this, {
            mode: 'dev',
            name: '<<title>>',
            game: {
                class: '<<front_namespace>>.Game',
                local: {module: '<<front_namespace>>.Local'},
                online: {module: '<<front_namespace>>.Online'},
            }
        });
    }
}
