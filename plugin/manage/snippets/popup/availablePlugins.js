/**
 * @var lx.Application App
 * @var lx.Plugin Plugin
 * @var lx.Snippet Snippet
 */

#lx:use lx.Button;
#lx:use lx.Scroll;

let main = new lx.Box({geom: true});
main.streamProportional();
main.overflow('visible');

let wrapper = new lx.Box({parent: main});
wrapper.addContainer();
wrapper.addStructure(lx.Scroll, {type: lx.VERTICAL});

let stream = new lx.Box({
    parent: wrapper,
    geom: true,
    key: 'stream'
});
stream.stream({
    direction:lx.VERTICAL,
    indent:'10px'
});

let pult = new lx.Box({parent: main, height: '60px'});
pult.gridProportional({indent: '10px'});
pult.add(lx.Button, {
    geom: [8, 0, 4, 1],
    text: 'Save',
    key: 'saveBut'
});
