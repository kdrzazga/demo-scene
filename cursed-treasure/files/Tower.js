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
        this.experienceRequirements = [121, 221];
        this.experiencePerShot = 1;
        this.experiencePerKill = 20;
        this.experience = 0;
        this.destroyed = false;
        this.tierIndex = 0;
        this.cooldown = 0;
        this.targetPriorities = [
            { key: 'first', label: 'First', rank: enemy => this.progressOf(enemy) },
            { key: 'last', label: 'Last', rank: enemy => -this.progressOf(enemy) },
            { key: 'strong', label: 'Strong', rank: enemy => enemy.health * 1000000 + this.progressOf(enemy) },
            { key: 'cleric', label: 'Cleric', rank: enemy => (enemy instanceof Cleric ? 1000000 : 0) + this.progressOf(enemy) }
        ];
        this.targetPriorityIndex = 0;
        this.investedGold = this.tiers[0].cost;
        const center = battle.battlefield.centerOf(tile);
        this.x = center.x;
        this.y = center.y;
        this.sprite = battle.scene.add.image(this.x, this.y + 12, this.textureKey()).setOrigin(0.5, 1).setDepth(100 + this.y);
        this.experienceBar = { width: 24, height: 3, gap: 2 };
        this.crownY = this.measureCrownY();
        this.experienceGraphics = battle.scene.add.graphics().setDepth(101 + this.y);
        this.readyMarker = battle.scene.add.text(this.x + this.experienceBar.width / 2 + 6, this.y, '▲', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#ffd740',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(101 + this.y).setVisible(false);
        tile.tower = this;
        this.refreshExperienceDisplay();
    }

    measureCrownY() {
        const textures = this.battle.scene.textures;
        const key = this.textureKey();
        const frame = this.sprite.frame;
        const textureTop = this.sprite.y - frame.height;
        for (let row = 0; row < frame.height; row++) {
            for (let column = 0; column < frame.width; column++) {
                if (textures.getPixelAlpha(column, row, key) > 0) return textureTop + row;
            }
        }
        return textureTop;
    }

    refreshExperienceDisplay() {
        const bar = this.experienceBar;
        const left = this.x - bar.width / 2;
        const top = this.crownY - bar.gap - bar.height;
        const ready = this.canUpgrade && this.hasEnoughExperience;
        this.experienceGraphics.clear();
        this.readyMarker.setPosition(this.readyMarker.x, top + 1).setVisible(ready);
        if (!this.canUpgrade) return;
        const fill = Math.min(1, this.experience / this.experienceNeeded);
        this.experienceGraphics.fillStyle(0x000000, 0.7);
        this.experienceGraphics.fillRect(left - 1, top - 1, bar.width + 2, bar.height + 2);
        this.experienceGraphics.fillStyle(ready ? 0xffd740 : 0x9b6bff, 1);
        this.experienceGraphics.fillRect(left, top, bar.width * fill, bar.height);
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

    get experienceNeeded() {
        return this.canUpgrade ? this.experienceRequirements[this.tierIndex] : 0;
    }

    get hasEnoughExperience() {
        return this.experience >= this.experienceNeeded;
    }

    gainExperience(amount) {
        if (this.destroyed) return;
        this.experience += amount;
        this.refreshExperienceDisplay();
    }

    creditKill() {
        this.gainExperience(this.experiencePerKill);
    }

    get sellValue() {
        return Math.floor(this.investedGold * this.sellRatio);
    }

    tryInstantKill(enemy, attacker) {
        const chance = this.tier.instantKillChance;
        if (enemy.isBoss || chance <= 0 || Math.random() >= chance) return false;
        this.battle.notify(enemy.x, enemy.y - 34, 'Instant kill!', '#ff5252');
        enemy.takeDamage(enemy.health, true, attacker);
        return true;
    }

    describeInstantKill() {
        const chance = this.tier.instantKillChance;
        return chance > 0 ? `
${Math.round(chance * 100)}% instant kill` : '';
    }

    pactEffect(name) {
        return this.battle.progress.pactEffect(`${this.race}.${name}`);
    }

    describeStats() {
        return `${this.title} ${this.tierNumerals[this.tierIndex]}\n` +
            `Damage ${Math.round(this.damage)}  Range ${Math.round(this.range)}\n` +
            this.describeSpecialty();
    }

    upgrade() {
        if (!this.canUpgrade || !this.hasEnoughExperience) return;
        this.tierIndex += 1;
        this.investedGold += this.tier.cost;
        this.experience = 0;
        this.sprite.setTexture(this.textureKey());
        this.crownY = this.measureCrownY();
        this.refreshExperienceDisplay();
    }

    update(dt) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (this.cooldown > 0) return;
        const targets = this.chooseTargets();
        if (targets.length === 0) return;
        targets.forEach(target => this.fireAt(target));
        this.gainExperience(targets.length * this.experiencePerShot);
        this.cooldown = this.tier.interval;
    }

    volleySize() {
        return 1;
    }

    chooseTargets() {
        return this.battle.enemiesWithin(this.x, this.y, this.range)
            .sort((first, second) => this.targetPriority.rank(second) - this.targetPriority.rank(first))
            .slice(0, this.volleySize());
    }

    get targetPriority() {
        return this.targetPriorities[this.targetPriorityIndex];
    }

    cycleTargetPriority() {
        this.targetPriorityIndex = (this.targetPriorityIndex + 1) % this.targetPriorities.length;
    }

    progressOf(enemy) {
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
        this.destroyed = true;
        this.sprite.destroy();
        this.readyMarker.destroy();
        this.experienceGraphics.destroy();
        this.tile.tower = null;
    }
}
