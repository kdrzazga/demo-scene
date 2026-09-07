function randomEquipmentColor(random) {
  const colors = [DieColor.BLUE, DieColor.YELLOW, DieColor.ORANGE];
  return colors[Math.floor(random() * colors.length)];
}

function applyReward(hero, reward, random) {
  if (!reward) {
    return null;
  }
  const rng = random || Math.random;
  if (reward.type === RewardType.COINS) {
    hero.addCoins(reward.amount);
    return 'Reward: +' + reward.amount + ' coins';
  }
  if (reward.type === RewardType.EQUIPMENT) {
    const color = randomEquipmentColor(rng);
    hero.addBonusDie(color);
    return 'Reward: found a ' + color + ' die';
  }
  if (reward.type === RewardType.UPGRADE) {
    hero.addBonusDie(DieColor.ORANGE);
    return 'Reward: upgraded gear, +1 orange die';
  }
  return null;
}
