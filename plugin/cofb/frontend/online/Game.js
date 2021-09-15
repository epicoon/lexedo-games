#lx:module lexedo.games.CofbOnline;

#lx:require Gamer;
#lx:require ChannelEventListener;

class Game extends lexedo.games.Game #lx:namespace lexedo.games.Cofb {
	getGamerClass() {
		return lexedo.games.Cofb.Gamer;
	}

}
