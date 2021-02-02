/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;

var wrapper = new lx.Box({geom: true});
wrapper.slot({
    cols: 1,
    rows: 1,
    k: 0.7
});

var slot = wrapper.child(0);
slot.gridProportional({
    indent: '10px'
});

slot.add(lx.Button, {key:'newGameBut', text:'Новая игра', geom: [6, 0, 6, 1]});
var center = slot.add(lx.Box, {key:'fieldBox', geom: [0, 1, 12, 10]});
slot.add(lx.Box, {key:'activeGamerLabel', geom: [0, 11, 12, 1], css:'lx-Box'});

center.slot({
    cols: 1,
    rows: 1
});
var field = center.child(0);

field.gridProportional({
    indent: '10px',
    cols: 3
});

field.add(lx.Box, 9, {
   css: 'lx-Box'
});
