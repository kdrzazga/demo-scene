new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 640,
    backgroundColor: '#120d18',
    scene: [BootScene, MapScene, PactScene, BattleScene]
});
