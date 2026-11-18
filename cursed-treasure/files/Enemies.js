class Peasant extends Enemy {
    describe() {
        return { name: 'Peasant', texture: 'hero-peasant', health: 34, speed: 46, armor: 0, capacity: 1, goldReward: 5, manaReward: 1, weakness: 'Unarmored and slow-witted. Anything kills them; cheap Goblin arrows are enough.' };
    }
}

class Squire extends Enemy {
    describe() {
        return { name: 'Squire', texture: 'hero-squire', health: 80, speed: 40, armor: 2, capacity: 1, goldReward: 9, manaReward: 2, weakness: 'Light armor blunts weak hits. Upgraded arrows and Cinder blasts cut through.' };
    }
}

class Ranger extends Enemy {
    describe() {
        return { name: 'Ranger', texture: 'hero-ranger', health: 48, speed: 72, armor: 0, capacity: 1, goldReward: 8, manaReward: 2, weakness: 'Fast but frail. Slow them with Bone Spires, then any tower finishes them.' };
    }
}

class Paladin extends Enemy {
    describe() {
        return { name: 'Paladin', texture: 'hero-paladin', health: 240, speed: 30, armor: 6, capacity: 2, goldReward: 22, manaReward: 5, weakness: 'Heavy armor shrugs off arrows. Use big Cinder hits, Meteor, or Wildfire burns (ignore armor).' };
    }
}

class Cleric extends Enemy {
    constructor(battle, route, healthScale) {
        super(battle, route, healthScale);
        this.healRadius = 64;
        this.healAmount = 10;
        this.healInterval = 1.2;
        this.healTimer = 0;
    }

    describe() {
        return { name: 'Cleric', texture: 'hero-cleric', health: 70, speed: 38, armor: 1, capacity: 1, goldReward: 14, manaReward: 3, weakness: 'Heals heroes around it. Fragile alone: Dread the group and kill it first.' };
    }

    update(dt) {
        const alive = super.update(dt);
        if (alive && !this.isStunned) this.pulseHealing(dt);
        return alive;
    }

    pulseHealing(dt) {
        this.healTimer += dt;
        if (this.healTimer < this.healInterval) return;
        this.healTimer -= this.healInterval;
        const patients = this.battle.enemiesWithin(this.x, this.y, this.healRadius)
            .filter(enemy => enemy !== this && enemy.health < enemy.maxHealth);
        if (patients.length === 0) return;
        patients.forEach(patient => patient.heal(this.healAmount));
        this.battle.addEffect(new Blast(this.battle.scene, this.x, this.y - 10, this.healRadius, 0xfff3b0, false));
    }
}

class BlackKnight extends Enemy {
    constructor(battle, route, healthScale) {
        super(battle, route, healthScale);
        this.knockbackDistance = 3.5;
        this.knockbackSpeed = 140;
        this.pendingKnockback = 0;
        this.healthBarWidth = 40;
        this.healthBarLift = 46;
        this.carryLabelLift = 46;
        this.walkCadence = 6;
        this.smiteExposureSeconds = 5;
        this.smiteWindupSeconds = 0.7;
        this.spireExposure = new Map();
        this.smiteTarget = null;
        this.smiteTimer = 0;
        battle.notify(this.x, this.y - 40, `${this.name} rides in!`, '#ff5252');
        battle.scene.cameras.main.shake(300, 0.004);
    }

    update(dt) {
        const alive = super.update(dt);
        if (alive) this.updateSmite(dt);
        return alive;
    }

    updateSmite(dt) {
        if (this.isStunned) {
            this.interruptSmite();
            return;
        }
        if (this.smiteTarget) {
            this.smiteTimer -= dt;
            if (this.smiteTimer <= 0) this.strike();
            return;
        }
        const spiresInReach = this.battle.towers.filter(tower =>
            tower.race === 'bone' && Phaser.Math.Distance.Between(tower.x, tower.y, this.x, this.y) <= tower.range);
        [...this.spireExposure.keys()]
            .filter(spire => !spiresInReach.includes(spire))
            .forEach(spire => this.spireExposure.delete(spire));
        spiresInReach.forEach(spire => {
            const exposure = (this.spireExposure.get(spire) || 0) + dt;
            this.spireExposure.set(spire, exposure);
            if (exposure >= this.smiteExposureSeconds && !this.smiteTarget) this.raiseSword(spire);
        });
    }

    raiseSword(spire) {
        this.smiteTarget = spire;
        this.smiteTimer = this.smiteWindupSeconds;
        this.sprite.setTexture('hero-blackKnight-raised');
    }

    interruptSmite() {
        if (!this.smiteTarget) return;
        this.spireExposure.delete(this.smiteTarget);
        this.lowerSword();
    }

    lowerSword() {
        this.smiteTarget = null;
        this.sprite.setTexture('hero-blackKnight');
    }

    strike() {
        const spire = this.smiteTarget;
        this.spireExposure.delete(spire);
        this.lowerSword();
        if (!this.battle.towers.includes(spire)) return;
        this.battle.addEffect(new Blast(this.battle.scene, this.x, this.y - 30, 18, 0xff3030));
        this.battle.shatterTower(spire);
    }

    describe() {
        return {
            name: 'Zawisza Czarny',
            texture: 'hero-blackKnight',
            health: 960,
            speed: 20,
            armor: 8,
            capacity: 15,
            goldReward: 150,
            manaReward: 40,
            weakness: 'Black plate laughs at arrows. Frost staggers him back, but 5s in a Bone Spire\'s reach and he shatters it. Dread breaks his swing.'
        };
    }

    reactToChill() {
        this.pendingKnockback += this.knockbackDistance;
    }

    advance(dt) {
        if (this.smiteTarget) return;
        if (this.pendingKnockback <= 0) {
            super.advance(dt);
            return;
        }
        const push = Math.min(this.pendingKnockback, this.knockbackSpeed * dt);
        this.pendingKnockback -= push;
        this.travelled = Phaser.Math.Clamp(this.travelled - this.heading * push, 0, this.route.length);
        const point = this.route.pointAt(this.travelled);
        this.x = point.x;
        this.y = point.y;
    }
}

class EnemyFactory {
    constructor() {
        this.enemyTypes = {
            peasant: Peasant,
            squire: Squire,
            ranger: Ranger,
            paladin: Paladin,
            cleric: Cleric,
            blackKnight: BlackKnight
        };
    }

    create(kind, battle, route, healthScale) {
        const EnemyType = this.enemyTypes[kind];
        return new EnemyType(battle, route, healthScale);
    }

    describe(kind) {
        return this.enemyTypes[kind].prototype.describe();
    }
}
