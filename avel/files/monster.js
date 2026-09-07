function removeFirst(items, value) {
  const copy = items.slice();
  const index = copy.indexOf(value);
  if (index >= 0) {
    copy.splice(index, 1);
  }
  return copy;
}

class Monster {
  constructor(config) {
    const settings = config || {};
    this.name = settings.name || 'Monster';
    this.kind = settings.kind || MonsterKind.SMALL;
    this.color = settings.color || MonsterColor.RED;
    this.toughness = settings.toughness || 1;
    this.damage = 0;
    this.diceColors = settings.diceColors ? settings.diceColors.slice() : [DieColor.PURPLE];
    this.reward = settings.reward || null;
    this.attribute = settings.attribute || null;
  }

  takeWounds(amount) {
    this.damage += amount;
  }

  remainingToughness() {
    return Math.max(0, this.toughness - this.damage);
  }

  isDefeated() {
    return this.damage >= this.toughness;
  }

  rollColors() {
    if (this.kind === MonsterKind.BEAST) {
      return [DieColor.BLACK, DieColor.BLACK, DieColor.PURPLE, DieColor.PURPLE, DieColor.PURPLE];
    }
    return this.diceColors.slice();
  }

  applyAttributeToHeroColors(colors) {
    if (this.attribute === MonsterAttribute.REDUCE_GREEN) {
      return removeFirst(colors, DieColor.GREEN);
    }
    if (this.attribute === MonsterAttribute.REDUCE_COLORED) {
      let reduced = colors.slice();
      reduced = removeFirst(reduced, DieColor.ORANGE);
      reduced = removeFirst(reduced, DieColor.BLUE);
      reduced = removeFirst(reduced, DieColor.YELLOW);
      return reduced;
    }
    return colors.slice();
  }
}
