class Hero {
  constructor(config) {
    const settings = config || {};
    this.name = settings.name || 'Hero';
    this.maxToughness = settings.maxToughness || 5;
    this.toughness = settings.toughness !== undefined ? settings.toughness : this.maxToughness;
    this.baseDice = settings.baseDice ? settings.baseDice.slice() : [DieColor.GREEN, DieColor.GREEN];
    this.bonusDice = settings.bonusDice ? settings.bonusDice.slice() : [];
    this.rerollTokens = settings.rerollTokens ? settings.rerollTokens.slice() : [];
    this.coins = settings.coins || 0;
  }

  battleDiceColors() {
    return this.baseDice.concat(this.bonusDice);
  }

  takeWounds(amount) {
    this.toughness = Math.max(0, this.toughness - amount);
  }

  heal(amount) {
    this.toughness = Math.min(this.maxToughness, this.toughness + amount);
  }

  fullHeal() {
    this.toughness = this.maxToughness;
  }

  isStunned() {
    return this.toughness <= 0;
  }

  addBonusDie(color) {
    this.bonusDice.push(color);
  }

  addCoins(amount) {
    this.coins += amount;
  }
}
