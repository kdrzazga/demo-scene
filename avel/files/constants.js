const BattleSymbol = Object.freeze({
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPELL: 'spell',
  BLANK: 'blank'
});

const DieColor = Object.freeze({
  GREEN: 'green',
  BLUE: 'blue',
  YELLOW: 'yellow',
  ORANGE: 'orange',
  PURPLE: 'purple',
  BLACK: 'black'
});

const MonsterKind = Object.freeze({
  SMALL: 'small',
  BIG: 'big',
  BEAST: 'beast'
});

const MonsterColor = Object.freeze({
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue'
});

const MonsterAttribute = Object.freeze({
  REDUCE_GREEN: 'reduceGreen',
  REDUCE_COLORED: 'reduceColored'
});

const RewardType = Object.freeze({
  COINS: 'coins',
  EQUIPMENT: 'equipment',
  UPGRADE: 'upgrade'
});

const BattlePhase = Object.freeze({
  READY: 'ready',
  ROLLED: 'rolled',
  RESOLVED: 'resolved',
  FINISHED: 'finished'
});

const BattleOutcome = Object.freeze({
  MONSTER_DEFEATED: 'monsterDefeated',
  HERO_STUNNED: 'heroStunned',
  ENDED_UNDEFEATED: 'endedUndefeated'
});

const DICE_FACES = Object.freeze({
  green: [BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.DEFENSE, BattleSymbol.DEFENSE, BattleSymbol.BLANK, BattleSymbol.BLANK],
  orange: [BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.DEFENSE, BattleSymbol.BLANK],
  blue: [BattleSymbol.DEFENSE, BattleSymbol.DEFENSE, BattleSymbol.DEFENSE, BattleSymbol.DEFENSE, BattleSymbol.ATTACK, BattleSymbol.BLANK],
  yellow: [BattleSymbol.SPELL, BattleSymbol.SPELL, BattleSymbol.ATTACK, BattleSymbol.DEFENSE, BattleSymbol.BLANK, BattleSymbol.BLANK],
  purple: [BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.DEFENSE, BattleSymbol.BLANK, BattleSymbol.BLANK, BattleSymbol.BLANK],
  black: [BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.ATTACK, BattleSymbol.DEFENSE, BattleSymbol.DEFENSE, BattleSymbol.BLANK]
});
