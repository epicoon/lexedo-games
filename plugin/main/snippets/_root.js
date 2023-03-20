/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Scroll;

#lx:tpl-begin;
    <lx.Box:._spread>
        .streamProportional()
        <lx.Box:@headBox (height:'60px')>
            .gridProportional(indent:'10px')
            <lx.Box (width:5, text:'TODO')>.border().setAttribute('title', 'Logo')
            <lx.Button:@savedGamesBut (width:5, text:#lx:i18n(SavedGames))>
            <lx.Box (width:1, text:'TODO')>.border().setAttribute('title', 'Color schema')
            <lx.LanguageSwitcher (width:1)>
        <lx.Box:@mainBox>
            <lx.Box:._spread>
                <lx.Box:._spread>
                    <lx.Box:.lgmain-Box (left:'10px')>
                        .addContainer()
                        .addStructure(lx.Scroll, {type: lx.VERTICAL})
                        <lx.Box:@gamesBox>.gridAdaptive(indent:'20px', minHeight:'200px', minWidth:'250px')
                <lx.JointMover (left:'3/4', width:'10px')>
                <lx.Box:._spread>
                    <lx.Box:.lgmain-Box (right:'10px')>
                        .addContainer()
                        .addStructure(lx.Scroll, {type: lx.VERTICAL})
                        <lx.Box:@currentGamesBox>.stream(indent:'10px', minHeight:'40px')
            <lx.JointMover (top:'2/3', height:'10px')>
            <lx.Box:._spread>
                <lx.socket.ChatBox:@chatBox (
                    id:'commonChat',
                    geom:['10px',0,null,null,'10px','10px'],
                    mateNameField:'login',
                    matesPosition: lx.LEFT
                )>
#lx:tpl-end;

#lx:use lx.ConfirmPopup;
#lx:use lx.InputPopup;
