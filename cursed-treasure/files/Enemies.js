class Peasant extends Enemy {
    describe() {
        return { name: 'Peasant', texture: 'hero-peasant', health: 34, speed: 46, armor: 0, capacity: 1, goldReward: 5, manaReward: 1 };
    }
}

class Squire extends Enemy {
    describe() {
        return { name: 'Squire', texture: 'hero-squire', health: 80, speed: 40, armor: 2, capacity: 1, goldReward: 9, manaReward: 2 };
    }
}

class Ranger extends Enemy {
    describe() {
        return { name: 'Ranger', texture: 'hero-ranger', health: 48, speed: 72, armor: 0, capacity: 1, goldReward: 8, manaReward: 2 };
    }
}

class Paladin extends Enemy {
    describe() {
        return { name: 'Paladin', texture: 'hero-paladin', health: 240, speed: 30, armor: 6, capacity: 2, goldReward: 22, manaReward: 5 };
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
        return { name: 'Cleric', texture: 'hero-cleric', health: 70, speed: 38, armor: 1, capacity: 1, goldReward: 14, manaReward: 3 };
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

class EnemyFactory {
    constructor() {
        this.enemyTypes = {
            peasant: Peasant,
            squire: Squire,
            ranger: Ranger,
            paladin: Paladin,
            cleric: Cleric
        };
    }

    create(kind, battle, route, healthScale) {
        const EnemyType = this.enemyTypes[kind];
        return new EnemyType(battle, route, healthScale);
    }
}
