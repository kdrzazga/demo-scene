const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: LAYOUT.width,
    height: LAYOUT.height,
    backgroundColor: '#0b0f14',
    scene: [GameScene]
};

new Phaser.Game(config);
