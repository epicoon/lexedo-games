#lx:namespace lexedo.games;
class GuiNode extends lx.GuiNode {
    getGame() {
        return this.getPlugin().environment.getGame();
    }
}
