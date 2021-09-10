/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;

var grid = new lx.Box({geom: true});
grid.grid({indent: '10px'});

grid.add(lx.Button, {
    width:6,
    text: 'disconnect',
    click: ()=>Plugin.environment._connector.socket.break()
});

grid.add(lx.Button, {
    width:6,
    text: 'log env',
    click: ()=>console.log(Plugin.environment)
});


