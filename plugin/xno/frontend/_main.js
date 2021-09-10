/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:require Game;
#lx:require Field;

const context = {
    plugin: Plugin
};
context.game = new im.Game(context);
context.field = new im.Field(context);

Snippet->>activeGamerLabel.align(lx.CENTER, lx.MIDDLE);
Snippet->>newGameBut.click(()=>context.game.start());
Snippet->>newGameBut.on('touchstart', ()=>context.game.start());
