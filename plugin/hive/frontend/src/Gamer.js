#lx:macros hive {lexedo.games.Hive}

class Gamer #lx:namespace lexedo.games.Hive {
    constructor(game, color) {
        this.game = game;
        this.color = color;
        this.chips = this.#createChips();
    }

    #createChips() {
        let result = new lx.Collection();

        result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_QUEEN));
        result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_BUG));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_BUG));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_SPIDER));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_SPIDER));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_ANT));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_ANT));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_ANT));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_GRASSHOPPER));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_GRASSHOPPER));
        //result.add(new >>>hive.Chip(this, >>>hive.Constants.CHIP_TYPE_GRASSHOPPER));

        return result;
    }
}
