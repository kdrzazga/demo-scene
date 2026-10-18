class GameObject {
    constructor({
        name = 'Object',
        position = [0, 0, 0],
        rotation = 0,
        size = [1, 1, 1],
        liftable = false,
        collisionRadius = null,
        gravity = 9.81,
    } = {}) {
        this.name = name;
        this.startPosition = position;
        this.startRotation = rotation;
        this.size = size;
        this.liftable = liftable;
        this.collisionRadius = collisionRadius ?? Math.hypot(size[0], size[2]) / 2 + 0.2;
        this.gravity = gravity;
        this.disposables = [];
        this.group = new THREE.Group();
        this.build();
        this.reset();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    build() {
    }

    reset() {
        this.group.position.set(...this.startPosition);
        this.group.rotation.set(0, this.startRotation, 0);
        this.held = false;
        this.fallSpeed = 0;
    }

    get position() {
        return this.group.position;
    }

    get radius() {
        return this.collisionRadius;
    }

    get solid() {
        return !this.held;
    }

    get halfHeight() {
        return this.size[1] / 2;
    }

    get top() {
        return this.group.position.y + this.halfHeight;
    }

    overlaps(other) {
        const dx = Math.abs(this.position.x - other.position.x), dz = Math.abs(this.position.z - other.position.z);
        return dx < (this.size[0] + other.size[0]) * 0.45 && dz < (this.size[2] + other.size[2]) * 0.45;
    }

    pickUp() {
        this.held = true;
        this.fallSpeed = 0;
    }

    drop() {
        this.held = false;
        this.fallSpeed = 0;
    }

    settle(dt, groundHeight) {
        if (this.held) return;
        const restY = groundHeight + this.halfHeight;
        const position = this.group.position;
        if (position.y <= restY) {
            position.y = restY;
            this.fallSpeed = 0;
            return;
        }
        this.fallSpeed += this.gravity * dt;
        position.y = Math.max(restY, position.y - this.fallSpeed * dt);
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
