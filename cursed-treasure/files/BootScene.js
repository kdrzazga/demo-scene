class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.audio('music', 'files/ChopinRyujinWataru.mp3');
    }

    create() {
        this.sound.play('music', { loop: true, volume: 0.5 });
        new TextureFactory(this).createAll();
        const levelCatalog = new LevelCatalog();
        this.registry.set('levelCatalog', levelCatalog);
        const pactCatalog = new PactCatalog();
        this.registry.set('pactCatalog', pactCatalog);
        this.registry.set('progress', new Progress(levelCatalog.levels.length, pactCatalog));
        this.scene.start('MapScene');
    }
}
