#lx:namespace lexedo.games;
class Status {
    constructor(value = null) {
        this.value = value;
    }

    set(value) {
        this.value = value;
    }

    is(value) {
        return this.value === value;
    }
}
