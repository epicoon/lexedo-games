/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:tpl-begin as list;
    <lx.Box:@main._spread>
        .gridProportional(indent:'10px', cols: 3)
        <lx.Box:@title (geom:[1, 0, 1, 1], text:'Game plugin blank')>.align(lx.CENTER, lx.MIDDLE)
        <lx.Button:@but (geom:[1, 1, 1, 1], text:'Ping')>
        <lx.Box:@response (geom:[1, 2, 1, 1])>.align(lx.CENTER, lx.MIDDLE)
#lx:tpl-end;
