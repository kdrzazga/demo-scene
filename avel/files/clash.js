function countSymbol(symbols, target) {
  let total = 0;
  for (const symbol of symbols) {
    if (symbol === target) {
      total += 1;
    }
  }
  return total;
}

function computeClash(heroSymbols, monsterSymbols) {
  const heroAttacks = countSymbol(heroSymbols, BattleSymbol.ATTACK);
  const heroDefenses = countSymbol(heroSymbols, BattleSymbol.DEFENSE);
  const monsterAttacks = countSymbol(monsterSymbols, BattleSymbol.ATTACK);
  const monsterDefenses = countSymbol(monsterSymbols, BattleSymbol.DEFENSE);
  return {
    heroAttacks: heroAttacks,
    heroDefenses: heroDefenses,
    monsterAttacks: monsterAttacks,
    monsterDefenses: monsterDefenses,
    woundsToMonster: Math.max(0, heroAttacks - monsterDefenses),
    woundsToHero: Math.max(0, monsterAttacks - heroDefenses)
  };
}
