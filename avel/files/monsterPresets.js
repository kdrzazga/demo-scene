class MonsterFactory {
  constructor() {
    this.presets = {
      small: [
        { name: 'Goblin', kind: MonsterKind.SMALL, color: MonsterColor.RED, toughness: 1, diceColors: [DieColor.PURPLE], reward: { type: RewardType.COINS, amount: 1 } },
        { name: 'Imp', kind: MonsterKind.SMALL, color: MonsterColor.BLUE, toughness: 2, diceColors: [DieColor.PURPLE], reward: { type: RewardType.EQUIPMENT, amount: 1 } },
        { name: 'Shade', kind: MonsterKind.SMALL, color: MonsterColor.GREEN, toughness: 2, diceColors: [DieColor.PURPLE, DieColor.PURPLE], reward: { type: RewardType.COINS, amount: 2 } }
      ],
      big: [
        { name: 'Ogre', kind: MonsterKind.BIG, color: MonsterColor.RED, toughness: 3, diceColors: [DieColor.PURPLE, DieColor.BLACK], attribute: MonsterAttribute.REDUCE_GREEN, reward: { type: RewardType.COINS, amount: 4 } },
        { name: 'Troll', kind: MonsterKind.BIG, color: MonsterColor.BLUE, toughness: 4, diceColors: [DieColor.BLACK, DieColor.BLACK], attribute: MonsterAttribute.REDUCE_COLORED, reward: { type: RewardType.EQUIPMENT, amount: 1 } },
        { name: 'Wraith', kind: MonsterKind.BIG, color: MonsterColor.GREEN, toughness: 4, diceColors: [DieColor.PURPLE, DieColor.BLACK], attribute: null, reward: { type: RewardType.UPGRADE, amount: 1 } }
      ],
      beast: [
        { name: 'The Beast', kind: MonsterKind.BEAST, color: MonsterColor.RED, toughness: 14, diceColors: [], reward: null }
      ]
    };
  }

  create(kind, index) {
    const list = this.presets[kind];
    return new Monster(list[index % list.length]);
  }

  random(kind, random) {
    const list = this.presets[kind];
    const pick = Math.floor((random || Math.random)() * list.length);
    return new Monster(list[pick]);
  }
}
