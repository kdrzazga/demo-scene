class GoblinWarren extends Tower {
    describeRace() {
        return { key: 'goblin', title: 'Goblin Warren', terrain: 'meadow' };
    }

    describeTiers() {
        return [
            { cost: 60, damage: 9, interval: 0.6, range: 100 },
            { cost: 70, damage: 15, interval: 0.5, range: 112 },
            { cost: 110, damage: 26, interval: 0.4, range: 126 }
        ];
    }

    describeSpecialty() {
        return this.hasPact('volley') ? 'Shoots two heroes at once' : 'Quick arrows';
    }

    volleySize() {
        return this.hasPact('volley') ? 2 : 1;
    }

    fireAt(target) {
        this.launch(target, 'arrow', 420, hitEnemy => {
            if (hitEnemy) hitEnemy.takeDamage(this.damage);
        });
    }
}

class BoneSpire extends Tower {
    constructor(battle, tile) {
        super(battle, tile);
        this.deepChillSlowBonus = 0.15;
        this.deepChillDurationBonus = 1;
    }

    describeRace() {
        return { key: 'bone', title: 'Bone Spire', terrain: 'tundra' };
    }

    describeTiers() {
        return [
            { cost: 70, damage: 6, interval: 1.0, range: 96, slowFactor: 0.6, slowDuration: 1.6 },
            { cost: 80, damage: 10, interval: 0.9, range: 108, slowFactor: 0.5, slowDuration: 1.9 },
            { cost: 120, damage: 16, interval: 0.8, range: 120, slowFactor: 0.4, slowDuration: 2.2 }
        ];
    }

    get slowFactor() {
        return this.hasPact('deepChill') ? this.tier.slowFactor - this.deepChillSlowBonus : this.tier.slowFactor;
    }

    get slowDuration() {
        return this.hasPact('deepChill') ? this.tier.slowDuration + this.deepChillDurationBonus : this.tier.slowDuration;
    }

    describeSpecialty() {
        return `Slows by ${Math.round((1 - this.slowFactor) * 100)}%`;
    }

    fireAt(target) {
        this.launch(target, 'frostbolt', 300, hitEnemy => {
            if (!hitEnemy) return;
            hitEnemy.takeDamage(this.damage);
            hitEnemy.applySlow(this.slowFactor, this.slowDuration);
            hitEnemy.reactToChill();
        });
    }
}

class CinderShrine extends Tower {
    constructor(battle, tile) {
        super(battle, tile);
        this.wildfireDamageRatio = 0.3;
        this.wildfireDuration = 3;
    }

    describeRace() {
        return { key: 'cinder', title: 'Cinder Shrine', terrain: 'ashland' };
    }

    describeTiers() {
        return [
            { cost: 90, damage: 16, interval: 1.7, range: 112, blastRadius: 40 },
            { cost: 100, damage: 28, interval: 1.55, range: 122, blastRadius: 48 },
            { cost: 150, damage: 46, interval: 1.4, range: 136, blastRadius: 56 }
        ];
    }

    describeSpecialty() {
        const burning = this.hasPact('wildfire') ? ', burns' : '';
        return `Blast radius ${this.tier.blastRadius}${burning}`;
    }

    fireAt(target) {
        this.launch(target, 'fireball', 240, (hitEnemy, impactX, impactY) => {
            const radius = this.tier.blastRadius;
            const burns = this.hasPact('wildfire');
            this.battle.enemiesWithin(impactX, impactY + 12, radius).forEach(enemy => {
                enemy.takeDamage(this.damage);
                if (burns) enemy.applyBurn(this.damage * this.wildfireDamageRatio, this.wildfireDuration);
            });
            this.battle.addEffect(new Blast(this.battle.scene, impactX, impactY + 6, radius, 0xff6a00));
        });
    }
}

class TowerFactory {
    constructor() {
        this.towerTypesByTerrain = {
            meadow: GoblinWarren,
            tundra: BoneSpire,
            ashland: CinderShrine
        };
    }

    blueprintFor(terrain, progress) {
        const TowerType = this.towerTypesByTerrain[terrain];
        if (!TowerType) return null;
        const race = TowerType.prototype.describeRace();
        const firstTier = TowerType.prototype.describeTiers()[0];
        return {
            type: TowerType,
            race: race.key,
            title: race.title,
            cost: firstTier.cost,
            damage: firstTier.damage * progress.damageMultiplier(race.key),
            range: firstTier.range * progress.rangeMultiplier(race.key)
        };
    }
}
