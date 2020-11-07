/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */
#lx:require @site/lib/Math3d.js;
#lx:require -R @site/lib/lx3d/;
//TODO
window.lx3d = {
    Math: Math3d,
    Camera: lx3dCamera,
    Geometry: lx3dGeometry,
    World: lx3dWorld
};
#lx:require -R src/;
#lx:use lexedo.games;

Plugin.environment = new lexedo.games.Environment(Plugin, {
    mode: 'dev',
    name: 'Hive',
    game: {
        local: {module: 'lexedo.games.HiveLocal'},
        online: {module: 'lexedo.games.HiveOnline'},
        class: 'lexedo.games.Hive.Game',
        channelEventListener: 'lexedo.games.Hive.EventListener'
        //connectionEventListener: 'lexedo.games.Hive.ConnectionEventListener'
    }
});
