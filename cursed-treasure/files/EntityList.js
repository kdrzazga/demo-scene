class EntityList {
    constructor() {
        this.items = [];
        this.incoming = [];
    }

    add(item) {
        this.incoming.push(item);
        return item;
    }

    update(dt) {
        this.admitIncoming();
        this.items = this.items.filter(item => {
            const alive = item.update(dt);
            if (!alive) item.destroy();
            return alive;
        });
        this.admitIncoming();
    }

    admitIncoming() {
        if (this.incoming.length === 0) return;
        this.items.push(...this.incoming);
        this.incoming = [];
    }

    get all() {
        return this.items;
    }

    get size() {
        return this.items.length + this.incoming.length;
    }
}
