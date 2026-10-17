class Checkpoint {
    constructor({ position = null, radius = 3, area = null, onReach = () => {} }) {
        this.position = position;
        this.radius = radius;
        this.area = area;
        this.onReach = onReach;
        this.reached = false;
    }

    check(point) {
        if (this.reached || !this.contains(point)) return;
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
