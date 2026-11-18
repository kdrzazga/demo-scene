class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        new TextureFactory(this).createAll();
        const levelCatalog = new LevelCatalog();
        this.registry.set('levelCatalog', levelCatalog);
        this.registry.set('pactCatalog', new PactCatalog());
        this.registry.set('progress', new Progress(levelCatalog.levels.length));
        this.scene.start('MapScene');
    }
}
