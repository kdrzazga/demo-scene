class PlayerPanelView {
    constructor(scene, x, y, player, callbacks) {
        this.scene = scene;
        this.player = player;
        this.callbacks = callbacks;
        this.frame = scene.add.rectangle(x, y, LAYOUT.panel.w, LAYOUT.panel.h, 0x161d24).setOrigin(0);
        this.frame.setStrokeStyle(3, 0x2a343d);
        this.body = scene.add.container(x, y);
    }

    refresh(isCurrent, phase) {
        this.frame.setStrokeStyle(isCurrent ? 4 : 3, isCurrent ? 0x7fd7ff : 0x2a343d);
        this.body.removeAll(true);
        const scene = this.scene;
        const parts = [];
        const player = this.player;

        parts.push(scene.add.text(16, 12, player.name, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: isCurrent ? '#7fd7ff' : '#cfd8dc'
        }).setOrigin(0));
        parts.push(scene.add.text(LAYOUT.panel.w - 16, 12, 'Prestige: ' + player.prestige + '/' + WIN_SCORE, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#f4e2a6',
            fontStyle: 'bold'
        }).setOrigin(1, 0));

        parts.push(scene.add.text(16, 46, 'bonuses', {
            fontFamily: 'monospace', fontSize: '12px', color: '#7f8c96'
        }).setOrigin(0));
        GEMS.forEach((gem, index) => {
            const cx = 34 + index * 46;
            const pip = Gfx.countedCard(scene, cx, 82, 15, gem, player.bonus(gem));
            parts.push(pip[0], pip[1]);
        });

        parts.push(scene.add.text(16, 108, 'tokens ' + player.tokenCount + '/' + MAX_TOKENS, {
            fontFamily: 'monospace', fontSize: '12px', color: '#7f8c96'
        }).setOrigin(0));
        const canDiscard = isCurrent && phase === PHASE.DISCARD;
        GEMS_WITH_GOLD.forEach((gem, index) => {
            const cx = 34 + index * 46;
            const pip = Gfx.countedToken(scene, cx, 144, 15, gem, player.tokens[gem]);
            if (canDiscard && player.tokens[gem] > 0) {
                pip[0].setStrokeStyle(3, 0xffffff, 0.9);
                pip[0].setInteractive({ useHandCursor: true });
                pip[0].on('pointerdown', () => this.callbacks.onToken(gem));
            }
            parts.push(pip[0], pip[1]);
        });

        parts.push(scene.add.text(16, 176, 'reserved', {
            fontFamily: 'monospace', fontSize: '12px', color: '#7f8c96'
        }).setOrigin(0));
        const canBuyReserved = isCurrent && phase === PHASE.IDLE;
        player.reserved.forEach((card, index) => {
            const mini = this._reservedCard(scene, 20 + index * 66, 196, card, canBuyReserved);
            parts.push(...mini);
        });

        parts.push(scene.add.text(16, LAYOUT.panel.h - 28, 'nobles ' + player.nobles.length + '  (+3 each)', {
            fontFamily: 'monospace', fontSize: '13px', color: '#caa64a'
        }).setOrigin(0));

        this.body.add(parts);
    }

    _reservedCard(scene, x, y, card, clickable) {
        const w = 56;
        const h = 74;
        const parts = [];
        const back = scene.add.rectangle(x, y, w, h, 0x232a33).setOrigin(0);
        back.setStrokeStyle(2, GEM_COLOR[card.gem]);
        parts.push(back);
        parts.push(scene.add.rectangle(x, y, w, 16, GEM_COLOR[card.gem]).setOrigin(0));
        if (card.points > 0) {
            parts.push(scene.add.text(x + 4, y + 16, String(card.points), {
                fontFamily: 'monospace', fontSize: '13px', color: '#cfd8dc'
            }).setOrigin(0));
        }
        parts.push(Gfx.tokenCircle(scene, x + w - 10, y + 8, 6, card.gem));
        let pipY = y + h - 11;
        for (const gem of GEMS) {
            const amount = card.costOf(gem);
            if (amount > 0) {
                const pip = Gfx.countedToken(scene, x + 11, pipY, 7, gem, amount);
                parts.push(pip[0], pip[1]);
                pipY -= 15;
            }
        }
        if (clickable) {
            back.setInteractive({ useHandCursor: true });
            back.on('pointerdown', () => this.callbacks.onReserved(card));
        }
        return parts;
    }
}
