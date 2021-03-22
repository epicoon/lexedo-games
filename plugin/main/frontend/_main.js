/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Image;
#lx:use lx.socket.WebSocketClient;

#lx:require src/;

Plugin.core = new Core(Plugin);
Plugin.core.run();
