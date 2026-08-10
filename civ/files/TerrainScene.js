class TerrainScene extends Phaser.Scene {

    constructor() {
        super('terrain');
        this.chosen = null;
        this.cards = [];
    }

    create() {
        this.ruleset = this.registry.get('ruleset');
        this.cards = [];
        document.getElementById('panel').innerHTML = '';
        this.add.text(this.scale.width / 2, 40, 'FOUND YOUR CITY', { fontFamily: 'monospace', fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, 74, 'Pick the land that fills half your map', { fontFamily: 'monospace', fontSize: '14px', color: '#90a4ae' }).setOrigin(0.5);

        const terrains = this.ruleset.terrainList();
        const cardW = 150, cardH = 110, gap = 18, perRow = 3;
        const totalW = perRow * cardW + (perRow - 1) * gap;
        const startX = (this.scale.width - totalW) / 2 + cardW / 2;
        terrains.forEach((t, i) => {
            const x = startX + (i % perRow) * (cardW + gap);
            const y = 150 + Math.floor(i / perRow) * (cardH + gap);
            this._card(t, x, y, cardW, cardH);
        });

        this.startBtn = this.add.text(this.scale.width / 2, this.scale.height - 44, '  START  ', { fontFamily: 'monospace', fontSize: '22px', color: '#546e7a', backgroundColor: '#263238', padding: { x: 18, y: 10 } }).setOrigin(0.5);
    }

    _card(terrain, x, y, w, h) {
        const rect = this.add.rectangle(x, y, w, h, terrain.color).setStrokeStyle(3, 0x11191f).setInteractive({ useHandCursor: true });
        const light = terrain.key === 'snow' || terrain.key === 'desert';
        const textColor = light ? '#212121' : '#ffffff';
        this.add.text(x, y - 28, terrain.name, { fontFamily: 'monospace', fontSize: '18px', color: textColor }).setOrigin(0.5);
        this.add.text(x, y + 12, 'food ' + terrain.food + '\nshield ' + terrain.shields + '\ntrade ' + terrain.trade, { fontFamily: 'monospace', fontSize: '12px', color: textColor, align: 'center' }).setOrigin(0.5);
        rect.on('pointerdown', () => this._select(terrain, rect));
        this.cards.push(rect);
    }

    _select(terrain, rect) {
        this.chosen = terrain.key;
        this.cards.forEach(c => c.setStrokeStyle(3, 0x11191f));
        rect.setStrokeStyle(5, 0xffeb3b);
        this.startBtn.setColor('#ffffff').setBackgroundColor('#2e7d32').setInteractive({ useHandCursor: true });
        this.startBtn.off('pointerdown');
        this.startBtn.on('pointerdown', () => this.scene.start('city', { terrainKey: this.chosen }));
    }
}
