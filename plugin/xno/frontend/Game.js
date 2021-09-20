class Game #lx:namespace im {
    #lx:const
        GAMER_X = 'X',
        GAMER_O = 'O';

    constructor(context) {
        this.context = context;
        this.active = false;
        this.currentGamer = null;
    }

    start() {
        this.reset();
        this.active = true;
        this.setCurrentGamer(self::GAMER_X);
    }

    reset() {
        this.context.field.clear();
        this.active = false;
        this.currentGamer = null;
    }

    nextTurn() {
        this.checkFinish();
        if (!this.active) return;

        this.setCurrentGamer(
            this.currentGamer == self::GAMER_X
                ? self::GAMER_O
                : self::GAMER_X
        );
    }

    checkFinish() {
        var line = this.context.field.findLine();
        if (line) {
            line.forEach(item=>item.fill('lightgreen'));
            this.context.plugin->>activeGamerLabel.text(
                'Победа ' + (line[0].isUsedBy == self::GAMER_X ? 'крестиков!' : 'ноликов!')
            );

            this.active = false;
            return;
        }

        if (this.context.field.isFull()) {
            this.context.plugin->>activeGamerLabel.text('Ничья');
            this.active = false;
        }
    }

    setCurrentGamer(code) {
        this.currentGamer = code;
        if (code == self::GAMER_X)
            this.context.plugin->>activeGamerLabel.text('Ход крестика :)')
        else if (code == self::GAMER_O)
            this.context.plugin->>activeGamerLabel.text('Ход нолика :)');
    }
}
