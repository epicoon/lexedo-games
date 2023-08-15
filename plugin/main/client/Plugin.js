#lx:client {
    #lx:use lx.socket.WebSocketClient;
}

class Plugin extends lx.Plugin {
    initCss(css) {
        css.inheritClass('lgmain-Box', 'AbstractBox');
        css.inheritClass('lgmain-curgamebox', 'AbstractBox', {
            padding: '10px',
            cursor: 'pointer'
        });
        css.addClass('lgmain-curgamebox-follow', {
            backgroundColor: css.preset.checkedDeepColor
        });
    }
    
    run() {

    }
}
