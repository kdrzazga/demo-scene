const testResults = [];

function check(description, condition) {
  testResults.push({ description: description, passed: condition });
  console.assert(condition, description);
}

function runTests() {
  testResults.length = 0;

  const ATTACK = BattleSymbol.ATTACK;
  const DEFENSE = BattleSymbol.DEFENSE;
  const BLANK = BattleSymbol.BLANK;
  const GREEN = DieColor.GREEN;
  const ORANGE = DieColor.ORANGE;
  const YELLOW = DieColor.YELLOW;
  const PURPLE = DieColor.PURPLE;
  const zero = () => 0;

  let result = computeClash([ATTACK, ATTACK], []);
  check('two hero attacks wound the monster twice', result.woundsToMonster === 2 && result.woundsToHero === 0);

  result = computeClash([ATTACK, ATTACK], [DEFENSE]);
  check('a monster defense blocks one hero attack', result.woundsToMonster === 1);

  result = computeClash([DEFENSE], [ATTACK, ATTACK]);
  check('a hero defense blocks one monster attack', result.woundsToHero === 1);

  result = computeClash([ATTACK], [DEFENSE, DEFENSE, DEFENSE]);
  check('wounds never go negative', result.woundsToMonster === 0);

  result = computeClash([BLANK, BLANK], [BLANK]);
  check('blanks do nothing', result.woundsToMonster === 0 && result.woundsToHero === 0);

  const hero = new Hero({ maxToughness: 5 });
  hero.takeWounds(3);
  check('hero loses toughness when wounded', hero.toughness === 2);
  hero.heal(10);
  check('healing is capped at max toughness', hero.toughness === 5);
  hero.takeWounds(5);
  check('hero is stunned at zero toughness', hero.isStunned() === true);

  const monster = new Monster({ toughness: 2 });
  monster.takeWounds(1);
  check('monster survives below its toughness', monster.isDefeated() === false);
  monster.takeWounds(1);
  check('monster is defeated at its toughness', monster.isDefeated() === true);

  const big = new Monster({ kind: MonsterKind.BIG, attribute: MonsterAttribute.REDUCE_GREEN });
  const reduced = big.applyAttributeToHeroColors([GREEN, GREEN, ORANGE]);
  check('reduce-green removes exactly one green die', reduced.filter(color => color === GREEN).length === 1);

  const beast = new Monster({ kind: MonsterKind.BEAST, toughness: 14 });
  check('the Beast rolls five dice', beast.rollColors().length === 5);

  const battleHero = new Hero({ maxToughness: 5 });
  const battleMonster = new Monster({ toughness: 1, diceColors: [PURPLE], reward: { type: RewardType.COINS, amount: 1 } });
  const battle = new Battle(battleHero, battleMonster, { random: zero });
  battle.rollClash();
  check('battle enters the rolled phase after rolling', battle.phase === BattlePhase.ROLLED);
  check('the hero rolls two base dice', battle.heroDice.length === 2);
  battle.resolveClash();
  check('monster is defeated by two attacks versus toughness one', battle.outcome === BattleOutcome.MONSTER_DEFEATED);
  check('hero took one wound in the clash', battleHero.toughness === 4);

  const spellHero = new Hero({ maxToughness: 5, bonusDice: [YELLOW] });
  const spellMonster = new Monster({ toughness: 9, diceColors: [PURPLE] });
  const spellBattle = new Battle(spellHero, spellMonster, { random: zero });
  spellBattle.rollClash();
  const symbols = spellBattle.resolvedHeroSymbols();
  check('a spell die auto-resolves to attack', symbols.filter(symbol => symbol === ATTACK).length === 3);

  const capHero = new Hero({ maxToughness: 9 });
  const capMonster = new Monster({ toughness: 99, diceColors: [PURPLE] });
  const capBattle = new Battle(capHero, capMonster, { random: zero });
  capBattle.rollClash();
  capBattle.resolveClash();
  check('battle waits between clashes', capBattle.phase === BattlePhase.RESOLVED);
  capBattle.continueBattle();
  capBattle.rollClash();
  capBattle.resolveClash();
  capBattle.continueBattle();
  capBattle.rollClash();
  capBattle.resolveClash();
  check('battle ends undefeated after three clashes', capBattle.outcome === BattleOutcome.ENDED_UNDEFEATED);

  return testResults;
}
