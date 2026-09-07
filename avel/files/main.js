const phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1200,
  height: 820,
  backgroundColor: '#0e1116',
  parent: 'game',
  scene: [BattleScene]
});
