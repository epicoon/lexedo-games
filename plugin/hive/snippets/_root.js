/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */
#lx:script '@site/lib/three.js';

#lx:tpl-begin as list;
<lx.Box:@mainBox._vol>
    .streamProportional(indent:'10px', direction: lx.HORIZONTAL)
    <lx.Box:@gamerPanel>(width:1)
    <lx.Box:@canvas>(width:6)
    <lx.Box:@gamerPanel>(width:1)
<@gamerPanel>
    <lx.Box:@chips._vol>
#lx:tpl-end;

list.mainBox.getChildren().forEach(box=>box.border());

//let mainBox = new lx.Box({key: 'mainBox', geom: true});
//let canvas = mainBox.add(lx.Box, {key:'canvas', geom: [0, 10, 100, 80]});
//
//let panelUp = mainBox.add(lx.Box, {key:'panelUp', geom: [0, 0, 100, 10]});
//let panelDown = mainBox.add(lx.Box, {key:'panelDown', geom: [0, 90, 100, 10]});
//
//let chipsUp = panelUp.add(lx.Box, {key:'chipsUp', geom: true});
//let chipsDown = panelDown.add(lx.Box, {key:'chipsDown', geom: true});
//
////mainBox.border();
//canvas.border();
//panelUp.border();
//panelDown.border();
