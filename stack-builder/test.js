function buildTestConfig() {
  return {
    factory: new CardFactory(),
    handSize: 5,
    startingActions: 1,
    startingPurchasingPower: 0,
    startingBuys: 1,
    startingDeck: [
      { name: 'Bronze', count: 7 },
      { name: 'Estate', count: 3 }
    ],
    supply: [
      { name: 'Bronze', count: 30-7 },
      { name: 'Silver', count: 10 },
      { name: 'Gold', count: 10 },
      { name: 'Estate', count: 10-3 },
      { name: 'Duchy', count: 10 },
      { name: 'Province', count: 5 },
      { name: 'TwoActions', count: 10 }
    ]
  };
}

const testResults = [];

function check(description, condition) {
  testResults.push({ description: description, passed: condition });
  console.assert(condition, description);
}

function runTests() {
  testResults.length = 0;

  const game = new Game(buildTestConfig());
  check('hand has 5 cards', game.player.hand.count === 5);
  check('draw pile has 5 cards', game.player.drawPile.count === 5);
  check('discard is empty', game.player.discardPile.count === 0);
  check('deck totals 10 cards', game.player.hand.count + game.player.drawPile.count === 10);
  check('starting actions is 1', game.player.actions === 1);
  check('starting power is 0', game.player.purchasingPower === 0);
  check('starting buys is 1', game.player.numberOfBuys === 1);
  check('starting victory points is 3', game.player.totalVictoryPoints() === 3);
  check('starts in buy phase with no action cards', game.phase === Phase.BUY);

  const treasureCount = game.player.hand.cards.filter(card => card.isTreasure()).length;
  game.playAllTreasures();
  check('power equals played treasures', game.player.purchasingPower === treasureCount);
  check('treasures left play area', game.player.playArea.count === treasureCount);

  const bronzeStack = game.supply.stackByName('Bronze');
  const bronzeBefore = bronzeStack.count;
  const discardBefore = game.player.discardPile.count;
  const bought = game.buyCard(bronzeStack);
  check('bronze was bought', bought === true);
  check('a single buy was spent', game.player.numberOfBuys === 0);
  check('bronze stack decreased', bronzeStack.count === bronzeBefore - 1);
  check('bought card went to discard', game.player.discardPile.count === discardBefore + 1);
  check('second buy is rejected', game.buyCard(bronzeStack) === false);

  game.endTurn();
  check('new hand has 5 cards', game.player.hand.count === 5);
  check('turn advanced to 2', game.turn === 2);
  check('play area cleared', game.player.playArea.count === 0);
  check('actions reset to 1', game.player.actions === 1);
  check('power reset to 0', game.player.purchasingPower === 0);
  check('buys reset to 1', game.player.numberOfBuys === 1);

  game.endActionPhase();
  game.supply.stackByName('Province').count = 0;
  game.buyCard(game.supply.stackByName('Bronze'));
  check('game ends when province is empty', game.finished === true);

  return testResults;
}
