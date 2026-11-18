class LooseGem {
    constructor(scene, route, distance, hoard) {
        this.route = route;
        this.distance = distance;
        this.hoard = hoard;
        this.driftSpeed = 16;
        this.bobSpeed = 4;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.collected = false;
        const point = route.pointAt(distance);
        this.x = point.x;
        this.y = point.y;
        this.sprite = scene.add.image(this.x, this.y, 'gem').setDepth(90);
    }

    update(dt) {
        if (this.collected) return false;
        this.distance += this.driftSpeed * dt;
        if (this.distance >= this.route.length) {
            this.hoard.returnGems(1);
            return false;
        }
        const point = this.route.pointAt(this.distance);
        this.x = point.x;
        this.y = point.y;
        this.bobPhase += this.bobSpeed * dt;
        this.sprite.setPosition(this.x, this.y - 3 + Math.sin(this.bobPhase) * 2);
        return true;
    }

    destroy() {
        this.sprite.destroy();
    }
}
