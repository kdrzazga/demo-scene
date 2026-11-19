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
        this.isBoss = true;
        this.knockbackDistance = 3.5;
        this.knockbackSpeed = 140;
        this.pendingKnockback = 0;
        this.healthBarWidth = 40;
        this.healthBarLift = 46;
        this.carryLabelLift = 46;
        this.walkCadence = 6;
        this.smiteExposureSeconds = 5;
        this.smiteWindupSeconds = 0.7;
        this.smashableRaces = new Set(['bone', 'cinder']);
        this.focusTower = null;
        this.smiteCharge = 0;
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
        if (this.smiteTarget) {
            this.smiteTimer -= dt;
            if (this.smiteTimer <= 0) this.strike();
            return;
        }
        const towersInReach = this.battle.canSmashTowers ? this.smashableTowersInReach() : [];
        if (!towersInReach.includes(this.focusTower)) {
            this.focusTower = towersInReach.length > 0 ? towersInReach[0] : null;
            this.smiteCharge = 0;
        }
        if (!this.focusTower) return;
        this.smiteCharge += dt;
        if (this.smiteCharge >= this.smiteExposureSeconds) this.raiseSword(this.focusTower);
    }

    smashableTowersInReach() {
        const distanceTo = tower => Phaser.Math.Distance.Between(tower.x, tower.y, this.x, this.y);
        return this.battle.towers
            .filter(tower => this.smashableRaces.has(tower.race) && distanceTo(tower) <= tower.range)
            .sort((first, second) => distanceTo(first) - distanceTo(second));
    }

    resetSmite() {
        this.focusTower = null;
        this.smiteCharge = 0;
    }

    raiseSword(tower) {
        this.smiteTarget = tower;
        this.smiteTimer = this.smiteWindupSeconds;
        this.sprite.setTexture('hero-blackKnight-raised');
    }

    lowerSword() {
        this.smiteTarget = null;
        this.sprite.setTexture('hero-blackKnight');
    }

    strike() {
        const tower = this.smiteTarget;
        this.resetSmite();
        this.lowerSword();
        if (!this.battle.towers.includes(tower) || !this.battle.canSmashTowers) return;
        this.battle.addEffect(new Blast(this.battle.scene, this.x, this.y - 30, 18, 0xff3030));
        this.battle.shatterTower(tower);
    }

    describe() {
        return {
            name: 'Zawisza Czarny',
            texture: 'hero-blackKnight',
            health: 1460,
            speed: 20,
            armor: 8,
            capacity: 15,
            goldReward: 150,
            manaReward: 40,
            weakness: 'Black plate laughs at arrows. Frost staggers him back, but 5s in reach of a Bone Spire or Cinder Shrine and he shatters it (3 towers per battle).'
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
        this.placeAt(this.travelled);
    }
}

class Mage extends Enemy {
    constructor(battle, route, healthScale) {
        super(battle, route, healthScale);
        this.isBoss = true;
        this.healthBarWidth = 36;
        this.healthBarLift = 48;
        this.carryLabelLift = 48;
        this.walkCadence = 7;
        this.callIntervalSeconds = 20;
        this.callDurationSeconds = 5;
        this.gemsPerCall = 3;
        this.callTimer = 0;
        this.isCalling = false;
        this.calledGems = [];
        battle.notify(this.x, this.y - 40, `${this.name} appears!`, '#7fdcff');
        battle.scene.cameras.main.shake(300, 0.004);
    }

    describe() {
        return {
            name: 'Mage Merlin',
            texture: 'hero-mage',
            health: 900,
            speed: 26,
            armor: 3,
            capacity: 10,
            goldReward: 120,
            manaReward: 40,
            weakness: 'Every 20s he stands still for 5s and calls 3 gems along the road to him. Strike while he chants; Recall pulls dropped gems back.'
        };
    }

    update(dt) {
        const alive = super.update(dt);
        if (alive) this.updateCall(dt);
        else this.releaseGems();
        return alive;
    }

    updateCall(dt) {
        this.callTimer += dt;
        if (!this.isCalling) {
            if (this.callTimer >= this.callIntervalSeconds) this.startCall();
            return;
        }
        if (this.callTimer >= this.callDurationSeconds) this.endCall();
    }

    startCall() {
        this.isCalling = true;
        this.callTimer = 0;
        this.sprite.setTexture('hero-mage-casting');
        const nearby = this.nearestLooseGems();
        this.calledGems = [...nearby, ...this.gemsFromHoard(this.gemsPerCall - nearby.length)];
        this.calledGems.forEach(gem => gem.answerCall(this));
        this.battle.addEffect(new Blast(this.battle.scene, this.x, this.y - 20, 40, 0x7fdcff, false));
        this.battle.notify(this.x, this.y - 44, `${this.name} calls the gems!`, '#7fdcff');
    }

    nearestLooseGems() {
        return this.battle.looseGems.all
            .filter(gem => !gem.collected && !gem.caller && gem.route === this.route)
            .sort((first, second) => Math.abs(first.distance - this.travelled) - Math.abs(second.distance - this.travelled))
            .slice(0, this.gemsPerCall);
    }

    gemsFromHoard(missing) {
        if (missing <= 0) return [];
        const taken = this.battle.hoard.takeGems(missing);
        return Array.from({ length: taken }, () => {
            const gem = new LooseGem(this.battle, this.route, this.route.length);
            this.battle.looseGems.add(gem);
            return gem;
        });
    }

    endCall() {
        this.isCalling = false;
        this.callTimer = 0;
        this.sprite.setTexture('hero-mage');
        this.releaseGems();
    }

    releaseGems() {
        this.calledGems.forEach(gem => gem.release());
        this.calledGems = [];
    }

    advance(dt) {
        if (this.isCalling) return;
        super.advance(dt);
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
            blackKnight: BlackKnight,
            mage: Mage
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
