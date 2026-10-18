class Checkpoint {
    constructor({ position = null, radius = 3, area = null, condition = () => true, onReach = () => {} }) {
        this.position = position;
        this.radius = radius;
        this.area = area;
        this.condition = condition;
        this.onReach = onReach;
        this.reached = false;
    }

    check(point) {
        if (this.reached || !this.contains(point) || !this.condition()) return;
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
