/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Scroll;

#lx:tpl-begin;
    <lx.Box:@mainBox._spread>
        .streamProportional()
        <lx.Box:@processBox.lgman-back (height:'60px')>
            .gridProportional(indent:'10px', cols:13)
            <lx.Box:.lgman-Box.lgman-smalltext (width:3)>
                <lx.Box:@processLabel._spread (text:'lexedo/games - games_server')>.align(lx.CENTER, lx.MIDDLE)
                <lx.Box (geom: ['10px', '10px', '20%', null, null, '10px'])>.align(lx.LEFT, lx.MIDDLE)
                    <lx.Box:@processRefreshIndicator.lgman-indicator (width:'auto', height:'auto')>
            <lx.Box:[f:statusText].lgman-Box.lgman-smalltext (width:2)>.align(lx.CENTER, lx.MIDDLE)
            <lx.Box:[f:pid].lgman-Box.lgman-smalltext (width:2)>.align(lx.CENTER, lx.MIDDLE)
            <lx.Box:[f:date].lgman-Box.lgman-smalltext (width:2)>.align(lx.CENTER, lx.MIDDLE)
            <lx.Button:@processErrors (text:'errors')>
            <lx.Button:@processLog (text:'log')>
            <lx.Button:@processRestart (text:'restart')>
            <lx.Button:@processStop (text:'stop')>
        <lx.Box>
            <lx.Box>
                .streamProportional()
                <lx.Box:.lgman-head (height:'40px', text:'Channels')>.align(lx.CENTER, lx.MIDDLE)
                <lx.Box>
                    <lx.Box:@channelsList._spread>.stream()
            <lx.JointMover (left:'1/5')>
            <lx.Box>
                .streamProportional()
                <lx.Box:.lgman-head (height:'40px', text:'Channel info')>.align(lx.CENTER, lx.MIDDLE)
                <lx.Box:@channelInfoBox.lgman-back>
                    .gridProportional(indent:'10px')
                    <lx.Box:@gameIcon.lgman-Box (geom:[0, 0, 2, 2])>.align(lx.CENTER, lx.MIDDLE)
                    <lx.Box:.lgman-Box (geom:[2, 0, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
                        <lx.Box (size:['auto','auto'], text:'Type: ')>
                        <lx.Box:[f:gameType].lgman-Label (size:['auto','auto'])>
                    <lx.Box:.lgman-Box (geom:[7, 0, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
                        <lx.Box (size:['auto','auto'], text:'Name: ')>
                        <lx.Box:[f:gameName].lgman-Label (size:['auto','auto'])>
                    <lx.Box:.lgman-Box (geom:[2, 1, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
                        <lx.Box (size:['auto','auto'], text:'Key: ')>
                        <lx.Box:[f:channelName].lgman-Label (size:['auto','auto'])>
                    <lx.Box:.lgman-Box (geom:[7, 1, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
                        <lx.Box (size:['auto','auto'], text:'Date: ')>
                        <lx.Box:[f:date].lgman-Label (size:['auto','auto'])>
                    <lx.Box:.lgman-Box (geom:[0, 2, 12, 4])>
                        .streamProportional()
                        <lx.Box (height: '60px')>
                            .grid(indent:'10px',cols:20)
                            <lx.Box (text:'id')>.align(lx.CENTER, lx.MIDDLE)
                            <lx.Box (text:'auth value', width:5)>.align(lx.CENTER, lx.MIDDLE)
                            <lx.Box (text:'connection id', width:8)>.align(lx.CENTER, lx.MIDDLE)
                            <lx.Box (text:'type', width:3)>.align(lx.CENTER, lx.MIDDLE)
                            <lx.Box (text:'date', width:3)>.align(lx.CENTER, lx.MIDDLE)
                        <lx.Box>.overflow('auto')
                            .addContainer()
                            .addStructure(lx.Scroll, {type: lx.VERTICAL})
                            <lx.Box:@connectionsList>.stream()
                    <lx.Box:.lgman-Box (geom:[0, 6, 12, 6])>
                        <lx.TreeBox:@channelData._spread>
#lx:tpl-end;
