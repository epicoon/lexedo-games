/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */
#lx:script '@site/lib/three.js';


let box = new lx.Box({
    key: 'canvas',
    geom: [10, 10, 80, 80]
});

box.border();
