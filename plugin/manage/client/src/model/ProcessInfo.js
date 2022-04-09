#lx:namespace lexedo.games.manage;
class ProcessInfo extends lx.BindableModel {
    #lx:const
        ACTIVE = lx\process\ProcessConst::PROCESS_STATUS_ACTIVE,
        CLOSED = lx\process\ProcessConst::PROCESS_STATUS_CLOSED,
        CRASHED = lx\process\ProcessConst::PROCESS_STATUS_CRASHED;

    #lx:schema
        status,
        pid,
        date;

    set(data) {
        var status;
        switch (data.status) {
            case self::ACTIVE: status = 'active'; break;
            case self::CLOSED: status = 'closed'; break;
            case self::CRASHED: status = 'crashed'; break;
        }
        this.status = status;
        this.pid = data.pid;
        //TODO date
    }

    isActive() {
        return this.status == 'active';
    }
}
