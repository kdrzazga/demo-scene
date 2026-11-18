class Projectile {
    constructor(battle, origin, target, textureKey, speed, onImpact) {
        this.target = target;
        this.speed = speed;
        this.onImpact = onImpact;
        this.aimHeight = 12;
        this.x = origin.x;
        this.y = origin.y;
        this.aimX = target.x;
        this.aimY = target.y - this.aimHeight;
        this.sprite = battle.scene.add.image(this.x, this.y, textureKey).setDepth(850);
    }

    update(dt) {
        if (this.target.alive) {
            this.aimX = this.target.x;
            this.aimY = this.target.y - this.aimHeight;
        }
        const deltaX = this.aimX - this.x;
        const deltaY = this.aimY - this.y;
        const distance = Math.hypot(deltaX, deltaY);
        const step = this.speed * dt;
        if (distance <= step) {
            this.onImpact(this.target.alive ? this.target : null, this.aimX, this.aimY);
            return false;
        }
        this.x += (deltaX / distance) * step;
        this.y += (deltaY / distance) * step;
        this.sprite.setPosition(this.x, this.y).setRotation(Math.atan2(deltaY, deltaX));
        return true;
    }

    destroy() {
        this.sprite.destroy();
    }
}
