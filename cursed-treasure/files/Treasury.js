class Treasury {
    constructor(gold, mana) {
        this.gold = gold;
        this.mana = mana;
        this.maxMana = 300;
        this.manaRegenPerSecond = 0.8;
    }

    update(dt) {
        this.earnMana(this.manaRegenPerSecond * dt);
    }

    spendGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        return true;
    }

    earnGold(amount) {
        this.gold += amount;
    }

    spendMana(amount) {
        if (this.mana < amount) return false;
        this.mana -= amount;
        return true;
    }

    earnMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }
}
