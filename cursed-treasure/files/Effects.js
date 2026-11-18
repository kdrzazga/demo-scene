class Effect {
    constructor(lifetime) {
        this.lifetime = lifetime;
        this.age = 0;
    }

    get progress() {
        return Math.min(1, this.age / this.lifetime);
    }

    update(dt) {
        this.age += dt;
        return this.age < this.lifetime;
    }

    destroy() {
    }
}

class FloatingText extends Effect {
    constructor(scene, x, y, message, color) {
        super(1.1);
        this.riseSpeed = 26;
        this.text = scene.add.text(x, y, message, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(950);
    }

    update(dt) {
        const alive = super.update(dt);
        this.text.y -= this.riseSpeed * dt;
        this.text.setAlpha(1 - this.progress * this.progress);
        return alive;
    }

    destroy() {
        this.text.destroy();
    }
}

class Blast extends Effect {
    constructor(scene, x, y, radius, color, filled = true) {
        super(0.4);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.filled = filled;
        this.graphics = scene.add.graphics().setDepth(880);
    }

    update(dt) {
        const alive = super.update(dt);
        const fade = 1 - this.progress;
        const currentRadius = this.radius * (0.35 + 0.65 * this.progress);
        this.graphics.clear();
        if (this.filled) {
            this.graphics.fillStyle(this.color, 0.45 * fade);
            this.graphics.fillCircle(this.x, this.y, currentRadius);
        }
        this.graphics.lineStyle(2, this.color, fade);
        this.graphics.strokeCircle(this.x, this.y, currentRadius);
        return alive;
    }

    destroy() {
        this.graphics.destroy();
    }
}

class MeteorStrike extends Effect {
    constructor(battle, x, y, radius, damage) {
        super(0.7);
        this.battle = battle;
        this.targetX = x;
        this.targetY = y;
        this.radius = radius;
        this.damage = damage;
        this.startX = x + 140;
        this.startY = y - 340;
        this.spinSpeed = 9;
        this.marker = battle.scene.add.graphics().setDepth(870);
        this.meteor = battle.scene.add.image(this.startX, this.startY, 'meteor').setDepth(905);
    }

    update(dt) {
        const alive = super.update(dt);
        const eased = this.progress * this.progress;
        this.meteor.setPosition(
            Phaser.Math.Linear(this.startX, this.targetX, eased),
            Phaser.Math.Linear(this.startY, this.targetY, eased)
        );
        this.meteor.rotation += this.spinSpeed * dt;
        this.marker.clear();
        this.marker.lineStyle(2, 0xff7a1a, 0.3 + 0.6 * this.progress);
        this.marker.strokeCircle(this.targetX, this.targetY, this.radius * (1.25 - 0.25 * this.progress));
        if (!alive) this.land();
        return alive;
    }

    land() {
        this.battle.enemiesWithin(this.targetX, this.targetY, this.radius).forEach(enemy => enemy.takeDamage(this.damage));
        this.battle.addEffect(new Blast(this.battle.scene, this.targetX, this.targetY, this.radius, 0xff7a1a));
        this.battle.scene.cameras.main.shake(160, 0.006);
    }

    destroy() {
        this.marker.destroy();
        this.meteor.destroy();
    }
}
