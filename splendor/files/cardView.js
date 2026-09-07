class CardView {
    constructor(scene, x, y, card, onClick) {
        this.scene = scene;
        this.card = card;
        this.onClick = onClick;
        this.selectable = false;
        this.container = scene.add.container(x, y);
        this._build();
    }

    _build() {
        const scene = this.scene;
        const w = LAYOUT.card.w;
        const h = LAYOUT.card.h;
        const card = this.card;
        const parts = [];

        this.background = scene.add.rectangle(0, 0, w, h, 0x232a33).setOrigin(0);
        this.background.setStrokeStyle(3, GEM_COLOR[card.gem]);
        parts.push(this.background);

        parts.push(scene.add.rectangle(0, 0, w, 30, GEM_COLOR[card.gem]).setOrigin(0));

        if (card.points > 0) {
            parts.push(scene.add.text(8, 3, String(card.points), {
                fontFamily: 'monospace',
                fontSize: '22px',
                color: GEM_TEXT_COLOR[card.gem],
                fontStyle: 'bold'
            }).setOrigin(0));
        }

        parts.push(Gfx.tokenCircle(scene, w - 17, 15, 9, card.gem));

        let pipY = h - 17;
        for (const gem of GEMS) {
            const amount = card.costOf(gem);
            if (amount > 0) {
                const pip = Gfx.countedToken(scene, 16, pipY, 11, gem, amount);
                parts.push(pip[0], pip[1]);
                pipY -= 25;
            }
        }

        this.container.add(parts);
        this.background.setInteractive({ useHandCursor: true });
        this.background.on('pointerdown', () => {
            if (this.onClick) {
                this.onClick(this.card, this);
            }
        });
        this.background.on('pointerover', () => {
            if (this.selectable) {
                this.container.setScale(1.05);
            }
        });
        this.background.on('pointerout', () => this.container.setScale(1));
    }

    setSelectable(value) {
        this.selectable = value;
    }

    setHighlight(value) {
        this.background.setStrokeStyle(value ? 5 : 3, value ? 0xffffff : GEM_COLOR[this.card.gem]);
    }

    destroy() {
        this.container.destroy();
    }
}
