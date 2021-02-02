/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;
#lx:use lx.Table;
#lx:use lx.ActiveBox;

let cols = 10;
let rows = 20;

let tetrisPart = new lx.Box({ geom: [0, 0, 50, 100] });
let leadersPart = new lx.ActiveBox({ geom: [55, 20, 30, 50], header:'Leaders' });
// leadersPart.border();
leadersPart.setSnippet('leaders');

let tetris = new lx.Box({key:'tetris', parent:tetrisPart, geom:true});
tetris.fill('white');
tetris.slot({
	indent: '10px',
	cols: 1,
	rows: 1,
	k: 0.7
});

let slot = tetris.child(0);
slot.gridProportional({
	rows: rows,
	cols: cols + 4,
	indent: '10px'
});
slot.begin();
	new lx.Table({
		key: 'map',
		size: [cols, rows],
		cols: cols,
		rows: rows
	});

	new lx.Button({
		key: 'newGame',
		size: [4, 2],
		text: 'New game'
	});

	(new lx.Box({width:4, text:'Next'})).align(lx.CENTER, lx.MIDDLE);
	new lx.Table({
		key: 'next',
		size: [4, 4],
		rows: 4,
		cols: 4
	});

	new lx.Button({
		key: 'pause',
		size: [4, 2],
		text: 'Pause'
	});

	(new lx.Box({width:4, text:'Level:'})).align(lx.CENTER, lx.MIDDLE);
	(new lx.Box({
		field: 'level',
		size: [4, 2],
		style: {fill:'lightgray'}
	})).align(lx.CENTER, lx.MIDDLE);

	(new lx.Box({width:4, text:'Lines:'})).align(lx.CENTER, lx.MIDDLE);
	(new lx.Box({
		field: 'lines',
		size: [4, 2],
		style: {fill:'lightgray'}
	})).align(lx.CENTER, lx.MIDDLE);

	(new lx.Box({width:4, text:'Score:'})).align(lx.CENTER, lx.MIDDLE);
	(new lx.Box({
		field: 'score',
		size: [4, 2],
		style: {fill:'lightgray'}
	})).align(lx.CENTER, lx.MIDDLE);
slot.end();

Snippet.addSnippet({
	plugin: 'lx/tools:snippets',
	snippet: 'inputPopup'
});
