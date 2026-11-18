class Tower {
    constructor(battle, tile) {
        const race = this.describeRace();
        this.battle = battle;
        this.tile = tile;
        this.race = race.key;
        this.title = race.title;
        this.tiers = this.describeTiers();
        this.tierNumerals = ['I', 'II', 'III'];
        this.sellRatio = 0.6;
        this.muzzleHeight = 30;
        this.tierIndex = 0;
        this.cooldown = 0;
        this.investedGold = this.tiers[0].cost;
        const center = battle.battlefield.centerOf(tile);
        this.x = center.x;
        this.y = center.y;
        this.sprite = battle.scene.add.image(this.x, this.y + 12, this.textureKey()).setOrigin(0.5, 1).setDepth(100 + this.y);
        tile.tower = this;
    }

    describeRace() {
        throw new Error('Tower subclasses must describe their race');
    }

    describeTiers() {
        throw new Error('Tower subclasses must describe their tiers');
    }

    describeSpecialty() {
        return '';
    }

    textureKey() {
        return `tower-${this.race}-${this.tierIndex}`;
    }

    get tier() {
        return this.tiers[this.tierIndex];
    }

    get damage() {
        return this.tier.damage * this.battle.progress.damageMultiplier(this.race);
    }

    get range() {
        return this.tier.range * this.battle.progress.rangeMultiplier(this.race);
    }

    get muzzle() {
        return { x: this.x, y: this.y - this.muzzleHeight + 12 };
    }

    get canUpgrade() {
        return this.tierIndex < this.tiers.length - 1;
    }

    get upgradeCost() {
        return this.canUpgrade ? this.tiers[this.tierIndex + 1].cost : 0;
    }

    get sellValue() {
        return Math.floor(this.investedGold * this.sellRatio);
    }

    hasPact(name) {
        return this.battle.progress.hasPact(`${this.race}.${name}`);
    }

    describeStats() {
        return `${this.title} ${this.tierNumerals[this.tierIndex]}\n` +
            `Damage ${Math.round(this.damage)}  Range ${Math.round(this.range)}\n` +
            this.describeSpecialty();
    }

    upgrade() {
        if (!this.canUpgrade) return;
        this.tierIndex += 1;
        this.investedGold += this.tier.cost;
        this.sprite.setTexture(this.textureKey());
    }

    update(dt) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (this.cooldown > 0) return;
        const targets = this.chooseTargets();
        if (targets.length === 0) return;
        targets.forEach(target => this.fireAt(target));
        this.cooldown = this.tier.interval;
    }

    volleySize() {
        return 1;
    }

    chooseTargets() {
        return this.battle.enemiesWithin(this.x, this.y, this.range)
            .sort((first, second) => this.threatOf(second) - this.threatOf(first))
            .slice(0, this.volleySize());
    }

    threatOf(enemy) {
        if (enemy.carriedGems > 0) return 100000 - enemy.travelled;
        return enemy.travelled;
    }

    fireAt(target) {
        throw new Error('Tower subclasses must fire');
    }

    launch(target, textureKey, speed, onImpact) {
        this.battle.addProjectile(new Projectile(this.battle, this.muzzle, target, textureKey, speed, onImpact));
    }

    destroy() {
        this.sprite.destroy();
        this.tile.tower = null;
    }
}
