#lx:use lx.socket.WebSocketClient;

#lx:require src/;

class Plugin extends lx.Plugin {
    run() {
        this.core = new Core(this);
        this.core.run();
    }
}
