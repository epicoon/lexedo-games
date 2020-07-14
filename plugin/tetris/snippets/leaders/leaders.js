/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Form;

Snippet.onload(()=>{#lx:require onclient;});

let leaders = new lx.Box({geom:true});
leaders.fill('white');
leaders.slot({
	indent: '10px',
	cols: 1,
	rows: 1,
	k: 1.3
});

let slot = leaders.child(0);
slot.streamProportional({indent:'10px'});
slot.begin();
	let header = new lx.Box();
	header.fill('lightgray');
	header.gridProportional();
	header.begin();
		(new lx.Box({text:'#',     width:1})).align(lx.CENTER, lx.MIDDLE);
		(new lx.Box({text:'name',  width:5})).align(lx.CENTER, lx.MIDDLE);
		(new lx.Box({text:'score', width:3})).align(lx.CENTER, lx.MIDDLE);
		(new lx.Box({text:'level', width:3})).align(lx.CENTER, lx.MIDDLE);
	header.end();

	let info = new lx.Box({key:'leadersTable'});
	info.stream({direction: lx.VERTICAL});
	info.height(5);
slot.end();
