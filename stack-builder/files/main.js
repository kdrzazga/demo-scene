function buildConfig() {
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
      { name: 'Bronze', count: 10 },
      { name: 'Silver', count: 10 },
      { name: 'Gold', count: 10 },
      { name: 'Estate', count: 10 },
      { name: 'Duchy', count: 10 },
      { name: 'Province', count: 10 },
      { name: 'TwoActions', count: 10 }
    ]
  };
}

const STACK_CONFIG = buildConfig();

const phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: '#0e1116',
  parent: 'game',
  scene: [GameScene]
});
