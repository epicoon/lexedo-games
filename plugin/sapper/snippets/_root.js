/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Table;
#lx:use lx.ActiveBox;

Plugin.title = 'Sapper';
Snippet.widget.slot({
	indent: '10px',
	cols: 1,
	rows: 1,
	k: 1.5
});

let slot = Snippet.widget.child(0);
slot.fill('#7777ff');

slot.gridProportional({
	indent: '10px',
	cols: 21
});

let face = new lx.Box({
	parent: slot,
	key: 'face',
	geom: [10, 0, 1, 1]
});
face.picture('smile.png');
face.style('cursor', 'pointer');

let cols = 30;
let rows = 16;

let table = new lx.Table({
	parent: slot,
	key: 'gameField',
	geom: [0, 1, 21, 14],
	cols: cols,
	rows: rows
});

let counter = new lx.Box({
	parent: slot,
	key: 'counter',
	geom: [0, 0, 2, 1]
});
counter.style('color', '#0000ff');
counter.style('font-size', '30px');
