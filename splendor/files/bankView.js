class BankView {
    constructor(scene, onPick) {
        this.scene = scene;
        this.onPick = onPick;
        this.piles = {};
        this.enabled = true;
        this._build();
    }

    _build() {
        const scene = this.scene;
        const x = LAYOUT.bank.x;
        const radius = LAYOUT.bank.radius;

        scene.add.text(x, LAYOUT.bank.firstY - 52, 'BANK TOKENS', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#8fa3b0'
        }).setOrigin(0.5);

        GEMS_WITH_GOLD.forEach((gem, index) => {
            const y = LAYOUT.bank.firstY + index * LAYOUT.bank.step;
            const circle = Gfx.tokenCircle(scene, x, y, radius, gem);
            const label = scene.add.text(x, y, '0', {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: GEM_TEXT_COLOR[gem],
                fontStyle: 'bold'
            }).setOrigin(0.5);
            circle.setInteractive({ useHandCursor: true });
            circle.on('pointerdown', () => {
                if (this.enabled && this.onPick) {
                    this.onPick(gem);
                }
            });
            this.piles[gem] = { circle, label };
        });
    }

    refresh(bank) {
        for (const gem of GEMS_WITH_GOLD) {
            const pile = this.piles[gem];
            const amount = bank.count(gem);
            pile.label.setText(String(amount));
            pile.circle.setAlpha(amount > 0 ? 1 : 0.25);
            pile.label.setAlpha(amount > 0 ? 1 : 0.25);
        }
    }

    setEnabled(value) {
        this.enabled = value;
    }
}
