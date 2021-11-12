/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:require Game;
#lx:require keyboard;

var game = new tetris.Game(Plugin);
game.bind(Plugin->>tetris);

Plugin->>newGame.click(()=> game.newGame());
Plugin->>pause.click(()=> game.toggleActivity());
