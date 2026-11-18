class PactScene extends Phaser.Scene {
    constructor() {
        super('PactScene');
    }

    create() {
        const progress = this.registry.get('progress');
        const pactCatalog = this.registry.get('pactCatalog');
        const { width, height } = this.scale;
        this.add.rectangle(0, 0, width, height, 0x150f1c).setOrigin(0);
        this.add.text(width / 2, 50, 'DARK PACTS', {
            fontFamily: 'monospace',
            fontSize: '36px',
            color: '#e6c8ff',
            stroke: '#3a1f55',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.add.text(width / 2, 92, `Unspent points: ${progress.freePoints}   (each star earned grants one)`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffd740'
        }).setOrigin(0.5);
        pactCatalog.branches.forEach((branch, column) => this.createBranch(branch, 170 + column * 310, progress));
        new Button(this, width / 2 - 110, 570, 180, 40, 'Reset pacts', () => {
            progress.resetPacts();
            this.scene.restart();
        });
        new Button(this, width / 2 + 110, 570, 180, 40, 'Back to map', () => this.scene.start('MapScene'));
    }

    createBranch(branch, x, progress) {
        this.add.text(x, 150, branch.title, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: branch.color
        }).setOrigin(0.5);
        branch.pacts.forEach((pact, row) => {
            const owned = progress.hasPact(pact.key);
            const label = `${owned ? '✓ ' : ''}${pact.title}\n${pact.description}`;
            new Button(this, x, 225 + row * 95, 270, 76, label, () => {
                if (progress.unlockPact(pact.key)) this.scene.restart();
            })
                .setHighlighted(owned)
                .setEnabled(owned || progress.freePoints > 0);
        });
    }
}
