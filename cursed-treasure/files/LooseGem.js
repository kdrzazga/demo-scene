class LooseGem {
    constructor(battle, route, distance) {
        this.battle = battle;
        this.route = route;
        this.distance = distance;
        this.hoard = battle.hoard;
        this.driftSpeed = 32;
        this.bobSpeed = 4;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.collected = false;
        this.caller = null;
        this.callSpeed = 70;
        const point = route.pointAt(distance);
        this.x = point.x;
        this.y = point.y;
        this.sprite = battle.scene.add.image(this.x, this.y, 'gem').setDepth(90);
    }

    update(dt) {
        if (this.collected) return false;
        if (this.caller) this.moveTowardCaller(dt);
        else if (this.battle.isRecallingGems) this.distance += this.driftSpeed * dt;
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

    answerCall(caller) {
        this.caller = caller;
        this.sprite.setTint(0x7fdcff);
    }

    release() {
        this.caller = null;
        this.sprite.clearTint();
    }

    moveTowardCaller(dt) {
        const step = this.callSpeed * dt;
        this.distance += Phaser.Math.Clamp(this.caller.travelled - this.distance, -step, step);
    }

    destroy() {
        this.sprite.destroy();
    }
}
