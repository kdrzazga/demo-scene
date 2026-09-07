class NobleView {
    constructor(scene, x, y, noble, onClick) {
        this.scene = scene;
        this.noble = noble;
        this.onClick = onClick;
        this.container = scene.add.container(x, y);
        this._build();
    }

    _build() {
        const scene = this.scene;
        const size = LAYOUT.noble.size;
        const parts = [];

        this.background = scene.add.rectangle(0, 0, size, size, 0x3a3326).setOrigin(0);
        this.background.setStrokeStyle(3, 0xcaa64a);
        parts.push(this.background);

        parts.push(scene.add.text(7, 4, String(this.noble.points), {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#f4e2a6',
            fontStyle: 'bold'
        }).setOrigin(0));

        parts.push(scene.add.text(size / 2, size / 2, 'NOBLE', {
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#f4e2a6',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        let pipX = 15;
        for (const gem of GEMS) {
            const amount = this.noble.requires(gem);
            if (amount > 0) {
                const pip = Gfx.countedCard(scene, pipX, size - 16, 10, gem, amount);
                parts.push(pip[0], pip[1]);
                pipX += 24;
            }
        }

        this.container.add(parts);
        this.background.setInteractive({ useHandCursor: true });
        this.background.on('pointerdown', () => {
            if (this.onClick) {
                this.onClick(this.noble, this);
            }
        });
    }

    setHighlight(value) {
        this.background.setStrokeStyle(value ? 5 : 3, value ? 0xffffff : 0xcaa64a);
    }

    destroy() {
        this.container.destroy();
    }
}
