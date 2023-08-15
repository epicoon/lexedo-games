#lx:namespace lexedo.games;
class GuiNode extends lx.GuiNode {
    getEnvironment() {
        return this.getPlugin().environment;
    }

    getGame() {
        return this.getPlugin().environment.getGame();
    }
}
