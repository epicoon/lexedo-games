#lx:client {
    #lx:use lx.socket.WebSocketClient;
}

class Plugin extends lx.Plugin {
    initCss(css) {
        css.inheritClass('lgmain-Box', 'AbstractBox');
    }
    
    run() {

    }
}
