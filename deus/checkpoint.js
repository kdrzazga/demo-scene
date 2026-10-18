class Checkpoint {
    constructor({ position = null, radius = 3, area = null, repeat = false, condition = () => true, onReach = () => {} }) {
        this.position = position;
        this.radius = radius;
        this.area = area;
        this.repeat = repeat;
        this.condition = condition;
        this.onReach = onReach;
        this.reached = false;
    }

    check(point) {
        const inside = this.contains(point);
        if (this.repeat && !inside) this.reached = false;
        if (this.reached || !inside || !this.condition()) return;
        this.reached = true;
        this.onReach();
    }

    contains({ x, z }) {
        if (this.area) return x >= this.area.minX && x <= this.area.maxX && z >= this.area.minZ && z <= this.area.maxZ;
        return Math.hypot(x - this.position[0], z - this.position[1]) <= this.radius;
    }

    reset() {
        this.reached = false;
    }
}
