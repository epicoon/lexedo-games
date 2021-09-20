/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

Snippet.onLoad(()=>{#lx:require _workerMenuClient;});

new lx.Box({geom:[40, 35, 20, 30], style:{fill:'white'}});
new lx.Box({key:'back', geom:true, style:{fill:'black',opacity:0.5}});

var tread = new lx.Box({key:'tread', geom:[40, 35, 20, 30]});
tread.gridProportional({indent:'10px', cols:4});
tread.begin();
	new lx.Box({width:4, key:'lbl', text:'Использовать рабочего'});
	new lx.Box({key:'m2', text:'-2'});
	new lx.Box({key:'m1', text:'-1'});
	new lx.Box({key:'p1', text:'+1'});
	new lx.Box({key:'p2', text:'+2'});
	new lx.Box({width:4, key:'add', text:'Обменять кубик на двух рабочих'});
tread.end();
tread.getChildren().forEach((a)=>{
	a.align(lx.CENTER, lx.MIDDLE);
	a.addClass('cofbBut');
});

Snippet.widget.hide();
