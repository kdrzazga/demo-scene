class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        new TextureFactory(this).createAll();
        const levelCatalog = new LevelCatalog();
        this.registry.set('levelCatalog', levelCatalog);
        const pactCatalog = new PactCatalog();
        this.registry.set('pactCatalog', pactCatalog);
        this.registry.set('progress', new Progress(levelCatalog.levels.length, pactCatalog));
        this.scene.start('MapScene');
    }
}
