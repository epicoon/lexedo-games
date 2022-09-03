#lx:namespace lexedo.games.manage;
class ProcessChecker {
    constructor(core) {
        this.core = core;
        this.interval = 2000;
        this.isActive = false;
        this.__checkingHandler = null;
    }

    start() {
        if (this.isActive) return;
        this.__checking();
        this.isActive = true;
    }

    stop() {
        if (!this.isActive) return;
        clearInterval(this.__checkingHandler);
        this.isActive = false;
        this.__checkingHandler = null;
    }

    changeInterval(interval) {
        this.interval = interval;
        if (this.isActive) {
            this.stop();
            this.start();
        }
    }

    __checking() {
        this.core.boxes.processRefreshIndicator.fill('green');
        ^Respondent.checkProcess().then(res=>{
            if (!res.success) {
                lx.tostWarning(res.data);
                return;
            }

            this.core.refresh(res.data);
            if (this.core.processInfo.isActive()) {
                this.stop();
            } else {
                if (!this.__checkingHandler)
                    this.__checkingHandler = setInterval(this.__checking.bind(this), this.interval);
            }
            this.core.boxes.processRefreshIndicator.fill('');
        });
    }
}
