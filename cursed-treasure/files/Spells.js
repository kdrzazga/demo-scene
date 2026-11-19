class Spell {
    constructor(battle) {
        this.battle = battle;
        this.radius = 0;
        this.invalidTargetMessage = 'Not there';
        this.isInstant = false;
    }

    get isReady() {
        return true;
    }

    get statusLabel() {
        return `${this.manaCost} mana`;
    }

    canCastAt(x, y) {
        return this.battle.battlefield.tileAtWorld(x, y) !== null;
    }

    cast(x, y) {
        throw new Error('Spell subclasses must cast');
    }
}

class MeteorSpell extends Spell {
    constructor(battle) {
        super(battle);
        this.title = 'Meteor';
        this.hotkey = 'Q';
        this.manaCost = 40;
        this.radius = 56;
        this.damage = 90;
    }

    cast(x, y) {
        this.battle.addEffect(new MeteorStrike(this.battle, x, y, this.radius, this.damage));
    }
}

class DreadSpell extends Spell {
    constructor(battle) {
        super(battle);
        this.title = 'Dread';
        this.hotkey = 'W';
        this.manaCost = 30;
        this.radius = 72;
        this.stunDuration = 2.5;
    }

    cast(x, y) {
        this.battle.enemiesWithin(x, y, this.radius).forEach(enemy => enemy.applyStun(this.stunDuration));
        this.battle.addEffect(new Blast(this.battle.scene, x, y, this.radius, 0x9b5cff));
    }
}

class ClearcutSpell extends Spell {
    constructor(battle) {
        super(battle);
        this.title = 'Clearcut';
        this.hotkey = 'E';
        this.manaCost = 15;
        this.invalidTargetMessage = 'Pick a forest tile';
    }

    canCastAt(x, y) {
        const tile = this.battle.battlefield.tileAtWorld(x, y);
        return Boolean(tile) && tile.forested;
    }

    cast(x, y) {
        const battlefield = this.battle.battlefield;
        const tile = battlefield.tileAtWorld(x, y);
        battlefield.clearForest(tile);
        const center = battlefield.centerOf(tile);
        this.battle.addEffect(new Blast(this.battle.scene, center.x, center.y, battlefield.tileSize * 0.7, 0x8bd36a));
    }
}

class RecallSpell extends Spell {
    constructor(battle) {
        super(battle);
        this.title = 'Recall';
        this.hotkey = 'R';
        this.manaCost = 25;
        this.duration = 15;
        this.isInstant = true;
    }

    get isReady() {
        return !this.battle.isRecallingGems;
    }

    get statusLabel() {
        const remaining = this.battle.gemRecallRemaining;
        return remaining > 0 ? `${Math.ceil(remaining)}s left` : `${this.manaCost} mana`;
    }

    cast() {
        this.battle.recallGems(this.duration);
        const hoardPosition = this.battle.battlefield.hoardPosition;
        this.battle.notify(hoardPosition.x, hoardPosition.y - 30, 'Gems roll home!', '#f19bff');
    }
}

class ArmageddonSpell extends Spell {
    constructor(battle) {
        super(battle);
        this.title = 'Armageddon';
        this.hotkey = 'T';
        this.manaCost = 75;
        this.isInstant = true;
        this.damage = 60;
        this.bossDamage = 120;
    }

    cast() {
        const battle = this.battle;
        battle.enemies.all
            .filter(enemy => enemy.alive)
            .forEach(enemy => this.strike(enemy));
        battle.addEffect(new Blast(battle.scene, battle.battlefield.pixelWidth / 2, battle.battlefield.pixelHeight / 2, battle.battlefield.pixelWidth * 0.6, 0xff3d00));
        battle.scene.cameras.main.shake(600, 0.01);
        battle.scene.cameras.main.flash(250, 255, 90, 20);
    }

    strike(enemy) {
        if (enemy.isBoss) {
            enemy.takeDamage(this.bossDamage, true);
            return;
        }
        if (enemy.carriedGems > 0) {
            enemy.takeDamage(enemy.health, true);
            return;
        }
        if (enemy instanceof Peasant) return;
        enemy.takeDamage(this.damage, true);
    }
}

class Spellbook {
    constructor(battle) {
        this.battle = battle;
        this.spells = [new MeteorSpell(battle), new DreadSpell(battle), new ClearcutSpell(battle), new RecallSpell(battle), new ArmageddonSpell(battle)];
        this.armedSpell = null;
    }

    toggle(spell) {
        if (this.armedSpell === spell) {
            this.disarm();
            return;
        }
        if (!spell.isReady || this.battle.treasury.mana < spell.manaCost) return;
        if (spell.isInstant) {
            this.disarm();
            if (this.battle.treasury.spendMana(spell.manaCost)) spell.cast();
            return;
        }
        this.armedSpell = spell;
    }

    disarm() {
        this.armedSpell = null;
    }

    castAt(x, y) {
        const spell = this.armedSpell;
        if (!spell) return;
        if (!spell.canCastAt(x, y)) {
            this.battle.notify(x, y, spell.invalidTargetMessage, '#ff8a80');
            return;
        }
        if (!this.battle.treasury.spendMana(spell.manaCost)) {
            this.battle.notify(x, y, 'Not enough mana', '#ff8a80');
            this.disarm();
            return;
        }
        spell.cast(x, y);
        this.disarm();
    }
}
