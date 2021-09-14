#lx:macros Const {lexedo.games.Cofb.Constants};

class Status #lx:namespace lexedo.games.Cofb {
	constructor(game) {
		this.game = game;
		this.value = >>>Const.STATUS_NONE;
	}

	is(status) { return this.value == status; }
	isNone() { return this.is(>>>Const.STATUS_NONE); }
	isPending() { return this.is(>>>Const.STATUS_PENDING); }
	isOver() { return this.is(>>>Const.STATUS_OVER); }
	isPhaseActivate() { return this.is(>>>Const.STATUS_PHASE_ACTIVATE); }
	isPlayOutCubes() { return this.is(>>>Const.STATUS_PLAY_OUT_CUBES); }
	isUseCube() { return this.is(>>>Const.STATUS_USE_CUBE); }
	isUseSilver() { return this.is(>>>Const.STATUS_USE_SILVER); }
	isTrade() { return this.is(>>>Const.STATUS_TRADE); }
	isGetBuilding() { return this.is(>>>Const.STATUS_GET_BUILDING); }
	isGetMCK() { return this.is(>>>Const.STATUS_GET_MCK); }
	isGetAS() { return this.is(>>>Const.STATUS_GET_AS); }
	isGetGoods() { return this.is(>>>Const.STATUS_GET_GOODS); }
	isSetChip() { return this.is(>>>Const.STATUS_SET_CHIP); }
	isAI() { return this.is(>>>Const.STATUS_AI); }

	set(status, data={}) {
		this.value = status;
		this.game.triggerLocalEvent('cofb_status_changed', [this.value, data]);
	};
	setNone() { this.set(>>>Const.STATUS_NONE); }
	setOver() {
		this.set(>>>Const.STATUS_OVER);
		this.game.triggerLocalEvent('cofb_game_over', this.value);
	}
	setPending() { this.set(>>>Const.STATUS_PENDING); }
	setPhaseActivate() { this.set(>>>Const.STATUS_PHASE_ACTIVATE); }
	setPlayOutCubes() { this.set(>>>Const.STATUS_PLAY_OUT_CUBES); }
	setUseCube(data) { this.set(>>>Const.STATUS_USE_CUBE, data); }
	setUseSilver(data) { this.set(>>>Const.STATUS_USE_SILVER, data); }
	setTrade() { this.set(>>>Const.STATUS_TRADE); }
	setGetBuilding() { this.set(>>>Const.STATUS_GET_BUILDING); }
	setGetMCK() { this.set(>>>Const.STATUS_GET_MCK); }
	setGetAS() { this.set(>>>Const.STATUS_GET_AS); }
	setGetGoods() { this.set(>>>Const.STATUS_GET_GOODS); }
	setSetChip() { this.set(>>>Const.STATUS_SET_CHIP); }
	setAI() { this.set(>>>Const.STATUS_AI); }
}
