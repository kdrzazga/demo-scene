const config = {
    type: Phaser.AUTO,
    width: 560,
    height: 560,
    parent: 'game',
    backgroundColor: '#0f171e',
    scene: [TerrainScene, CityScene],
    callbacks: {
        preBoot: game => game.registry.set('ruleset', new Ruleset())
    }
};

new Phaser.Game(config);
