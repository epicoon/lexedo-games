#lx:namespace lxGames.manage;
class CommonProcessStatus extends lx.BindableModel {
    #lx:const
        ACTIVE = lx\process\ProcessConst::PROCESS_STATUS_ACTIVE,
        CLOSED = lx\process\ProcessConst::PROCESS_STATUS_CLOSED,
        CRASHED = lx\process\ProcessConst::PROCESS_STATUS_CRASHED,
        PENDING = 4;

    #lx:schema
        status,
        statusText,
        pid,
        date;

    constructor(core) {
        super();
        this.core = core;

        this.interval = 2000;
        this.isWatching = false;
        this.__checkingHandler = null;

        this.afterSet('status', function(val) {
            switch (val) {
                case self::ACTIVE: this.statusText = 'active'; break;
                case self::PENDING: this.statusText = 'closed'; break;
                case self::CLOSED: this.statusText = 'closed'; break;
                case self::CRASHED: this.statusText = 'crashed'; break;
            }
        });

        this.core.getPlugin().on('connectionClosed', ()=>{
            setTimeout(()=>this.watchOff(), 200);
        });
    }

    watchOn() {
        if (this.isWatching) return;
        __watch(this);
        this.isWatching = true;
    }

    watchOff() {
        if (!this.isWatching) return;
        clearInterval(this.__checkingHandler);
        this.isWatching = false;
        this.__checkingHandler = null;
    }

    changeInterval(interval) {
        this.interval = interval;
        if (this.isWatching) {
            this.watchOff();
            this.watchOn();
        }
    }

    setPending() { this.status = self::PENDING; }

    isActive() { return this.status == self::ACTIVE; }
    isPending() { return this.status == self::PENDING; }
    isClosed() { return this.status == self::CLOSED; }
    isCrashed() { return this.status == self::CRASHED; }
}

function __watch(self) {
    self.status = lxGames.manage.CommonProcessStatus.CLOSED;
    ^Respondent.checkProcess().then(res=>{
        if (!res.success) {
            lx.tostWarning(res.data);
            return;
        }

        self.setFields(res.data.process);
        if (self.isActive()) {
            self.watchOff();
            self.core.getPlugin().trigger('commonChannelFound', {
                connectionData: res.data.connectionData
            });
            return;
        }

        self.status = lxGames.manage.CommonProcessStatus.PENDING;
        if (!self.__checkingHandler)
            self.__checkingHandler = setInterval(()=>__watch(self), self.interval);
    });
}
