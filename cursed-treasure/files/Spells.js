class Spell {
    constructor(battle) {
        this.battle = battle;
        this.radius = 0;
        this.invalidTargetMessage = 'Not there';
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

class Spellbook {
    constructor(battle) {
        this.battle = battle;
        this.spells = [new MeteorSpell(battle), new DreadSpell(battle), new ClearcutSpell(battle)];
        this.armedSpell = null;
    }

    toggle(spell) {
        if (this.armedSpell === spell) {
            this.disarm();
            return;
        }
        if (this.battle.treasury.mana < spell.manaCost) return;
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
