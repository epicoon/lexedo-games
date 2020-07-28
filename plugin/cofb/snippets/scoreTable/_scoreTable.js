/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Box} Snippet
 */

#lx:use lx.Image;

Snippet.onLoad(()=>{#lx:require _scoreTableClient;});
Snippet.widget.hide();

new lx.Rect({geom:true, style: {fill: 'black', opacity: 0.5}});

var main = new lx.Box({geom:true});
main.streamProportional({indent:'10px'});

var header = main.add(lx.Box);
var body = main.add(lx.Box, {key:'body', height:12});

new lx.Rect({parent:header, geom:true, style:{fill:'black', opacity:0.5}});
header.style('color', 'white');

var title = new lx.Box({
	parent: header,
	geom: true,
	text: 'Набранные очки'
});
title.align(lx.CENTER, lx.MIDDLE);
title->text.adapt();

var closeBox = new lx.Box({parent: header, margin: '10px'});
var image = new lx.Image({
	parent: closeBox,
	key: 'closeBut',
	geom: [null, 0, 0, 0, 0],
	filename: 'close.png'
});
image.style('cursor', 'pointer');
image.adapt();

body.gridProportional({cols:2, step:'10px'});
