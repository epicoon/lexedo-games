class Timer extends lx.Timer #lx:namespace tetris {
	constructor(owner) {
		super();

		this.owner = owner;
		this.periodDuration = 500;

		this.onCycleEnds(()=>this.owner.fallFigure());
	}
}
