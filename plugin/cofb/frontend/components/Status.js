#lx:private;

class bgStatus {
	#lx:const
		NONE = 0,
		PENDING = 1,
		OVER = 2,

		PHASE_ACTIVATE = 3,
		PLAY_OUT_CUBES = 4,

		USE_CUBE = 5,
		USE_SILVER = 6,
		TRADE = 7,

		GET_BUILDING = 8,
		GET_MCK = 9,
		GET_AS = 10,
		GET_GOODS = 11,
		SET_CHIP = 12,

		AI = 13;

	constructor() {
		this.value = self::NONE;
	}

	is(status) { return this.value == status; }
	isNone() { return this.is(self::NONE); }
	isPending() { return this.is(self::PENDING); }
	isOver() { return this.is(self::OVER); }
	isPhaseActivate() { return this.is(self::PHASE_ACTIVATE); }
	isPlayOutCubes() { return this.is(self::PLAY_OUT_CUBES); }
	isUseCube() { return this.is(self::USE_CUBE); }
	isUseSilver() { return this.is(self::USE_SILVER); }
	isTrade() { return this.is(self::TRADE); }
	isGetBuilding() { return this.is(self::GET_BUILDING); }
	isGetMCK() { return this.is(self::GET_MCK); }
	isGetAS() { return this.is(self::GET_AS); }
	isGetGoods() { return this.is(self::GET_GOODS); }
	isSetChip() { return this.is(self::SET_CHIP); }
	isAI() { return this.is(self::AI); }

	set(status, data={}) {
		this.value = status;
		cofb.EventSupervisor.trigger('cofb_status_changed', [this.value, data]);
	};
	setNone() { this.set(self::NONE); }
	setOver() {
		this.set(self::OVER);
		cofb.EventSupervisor.trigger('cofb_game_over', this.value);
	}
	setPending() { this.set(self::PENDING); }
	setPhaseActivate() { this.set(self::PHASE_ACTIVATE); }
	setPlayOutCubes() { this.set(self::PLAY_OUT_CUBES); }
	setUseCube(data) { this.set(self::USE_CUBE, data); }
	setUseSilver(data) { this.set(self::USE_SILVER, data); }
	setTrade() { this.set(self::TRADE); }
	setGetBuilding() { this.set(self::GET_BUILDING); }
	setGetMCK() { this.set(self::GET_MCK); }
	setGetAS() { this.set(self::GET_AS); }
	setGetGoods() { this.set(self::GET_GOODS); }
	setSetChip() { this.set(self::SET_CHIP); }
	setAI() { this.set(self::AI); }
}

cofb.Status = bgStatus;
