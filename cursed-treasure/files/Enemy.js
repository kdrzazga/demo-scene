class Enemy {
    constructor(battle, route, healthScale) {
        const profile = this.describe();
        this.battle = battle;
        this.route = route;
        this.name = profile.name;
        this.maxHealth = Math.round(profile.health * healthScale);
        this.health = this.maxHealth;
        this.baseSpeed = profile.speed;
        this.armor = profile.armor;
        this.capacity = profile.capacity;
        this.goldReward = profile.goldReward;
        this.manaReward = profile.manaReward;
        this.gemPickupRadius = 12;
        this.healthBarWidth = 18;
        this.healthBarLift = 31;
        this.carryLabelLift = 30;
        this.travelled = 0;
        this.heading = 1;
        this.carriedGems = 0;
        this.slowFactor = 1;
        this.slowRemaining = 0;
        this.stunRemaining = 0;
        this.burnDamagePerSecond = 0;
        this.burnRemaining = 0;
        this.walkPhase = Math.random() * Math.PI * 2;
        this.walkCadence = 11;
        this.alive = true;
        const start = route.pointAt(0);
        this.x = start.x;
        this.y = start.y;
        this.sprite = battle.scene.add.image(this.x, this.y, profile.texture).setOrigin(0.5, 0.85);
        this.gemSprite = battle.scene.add.image(this.x, this.y, 'gem').setVisible(false);
        this.gemCountText = battle.scene.add.text(this.x, this.y, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#f8c4ff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5).setVisible(false);
    }

    describe() {
        throw new Error('Enemy subclasses must describe themselves');
    }

    get currentSpeed() {
        return this.baseSpeed * this.slowFactor;
    }

    get isStunned() {
        return this.stunRemaining > 0;
    }

    get healthRatio() {
        return this.health / this.maxHealth;
    }

    update(dt) {
        if (!this.alive) return false;
        this.updateConditions(dt);
        if (!this.alive) return false;
        if (!this.isStunned) this.advance(dt);
        if (!this.alive) return false;
        this.collectNearbyGem();
        this.refreshSprite(dt);
        return true;
    }

    updateConditions(dt) {
        if (this.slowRemaining > 0) {
            this.slowRemaining -= dt;
            if (this.slowRemaining <= 0) this.slowFactor = 1;
        }
        if (this.stunRemaining > 0) this.stunRemaining -= dt;
        if (this.burnRemaining > 0) {
            this.burnRemaining -= dt;
            this.takeDamage(this.burnDamagePerSecond * dt, true);
        }
    }

    advance(dt) {
        const previousX = this.x;
        this.travelled += this.heading * this.currentSpeed * dt;
        if (this.heading > 0 && this.travelled >= this.route.length) {
            this.travelled = this.route.length;
            this.reachHoard();
        } else if (this.heading < 0 && this.travelled <= 0) {
            this.travelled = 0;
            this.battle.handleEscape(this);
            return;
        }
        const point = this.route.pointAt(this.travelled);
        this.x = point.x;
        this.y = point.y;
        if (this.x !== previousX) this.sprite.setFlipX(this.x < previousX);
    }

    reachHoard() {
        this.carriedGems += this.battle.hoard.takeGems(this.capacity - this.carriedGems);
        this.heading = -1;
    }

    collectNearbyGem() {
        if (this.carriedGems >= this.capacity) return;
        const gem = this.battle.looseGemNear(this.x, this.y, this.gemPickupRadius);
        if (!gem) return;
        gem.collected = true;
        this.carriedGems += 1;
        this.heading = -1;
    }

    refreshSprite(dt) {
        if (!this.isStunned) this.walkPhase += this.walkCadence * dt * this.slowFactor;
        const bob = this.isStunned ? 0 : -Math.abs(Math.sin(this.walkPhase)) * 2;
        const depth = 100 + this.y;
        this.sprite.setPosition(this.x, this.y + bob).setDepth(depth);
        this.refreshTint();
        const carrying = this.carriedGems > 0;
        const gemY = this.y - this.carryLabelLift + bob;
        this.gemSprite.setVisible(carrying);
        this.gemCountText.setVisible(this.carriedGems > 1);
        if (carrying) this.gemSprite.setPosition(this.x, gemY).setDepth(depth + 1);
        if (this.carriedGems > 1) this.gemCountText.setText(`x${this.carriedGems}`).setPosition(this.x + 7, gemY).setDepth(depth + 1);
    }

    reactToChill() {
    }

    refreshTint() {
        if (this.isStunned) this.sprite.setTint(0xb388ff);
        else if (this.burnRemaining > 0) this.sprite.setTint(0xffa070);
        else if (this.slowRemaining > 0) this.sprite.setTint(0x9fd8ff);
        else this.sprite.clearTint();
    }

    takeDamage(amount, piercing = false) {
        if (!this.alive) return;
        const dealt = piercing ? amount : Math.max(1, amount - this.armor);
        this.health -= dealt;
        if (this.health > 0) return;
        this.alive = false;
        this.battle.handleKill(this);
    }

    heal(amount) {
        if (!this.alive) return;
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    applySlow(factor, duration) {
        this.slowFactor = Math.min(this.slowFactor, factor);
        this.slowRemaining = Math.max(this.slowRemaining, duration);
    }

    applyStun(duration) {
        this.stunRemaining = Math.max(this.stunRemaining, duration);
    }

    applyBurn(damagePerSecond, duration) {
        this.burnDamagePerSecond = Math.max(this.burnRemaining > 0 ? this.burnDamagePerSecond : 0, damagePerSecond);
        this.burnRemaining = Math.max(this.burnRemaining, duration);
    }

    destroy() {
        this.sprite.destroy();
        this.gemSprite.destroy();
        this.gemCountText.destroy();
    }
}
