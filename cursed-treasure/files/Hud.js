class Hud {
    constructor(scene, battle) {
        this.scene = scene;
        this.battle = battle;
        this.top = battle.battlefield.pixelHeight;
        this.height = scene.scale.height - this.top;
        this.depth = 1100;
        this.manaBar = { x: 160, y: this.top + 36, width: 140, height: 16 };
        const width = scene.scale.width;
        const middle = this.top + this.height / 2;
        const textStyle = { fontFamily: 'monospace', fontSize: '15px', color: '#f3e9ff' };
        scene.add.rectangle(0, this.top, width, this.height, 0x150f1c).setOrigin(0).setDepth(this.depth).setInteractive();
        scene.add.rectangle(0, this.top, width, 2, 0x5b3f7a).setOrigin(0).setDepth(this.depth);
        this.goldText = scene.add.text(16, this.top + 10, '', { ...textStyle, color: '#ffd740' }).setDepth(this.depth + 1);
        this.gemText = scene.add.text(16, this.top + 34, '', { ...textStyle, color: '#f19bff' }).setDepth(this.depth + 1);
        this.waveText = scene.add.text(160, this.top + 10, '', textStyle).setDepth(this.depth + 1);
        this.manaGraphics = scene.add.graphics().setDepth(this.depth + 1);
        this.manaText = scene.add.text(this.manaBar.x + this.manaBar.width / 2, this.manaBar.y + this.manaBar.height / 2, '', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(this.depth + 2);
        this.callWaveButton = new Button(scene, 395, middle, 160, 44, '', () => battle.callWave()).setDepth(this.depth + 2);
        this.spellButtons = battle.spellbook.spells.map((spell, index) =>
            new Button(scene, 530 + index * 96, middle, 88, 50, '', () => battle.toggleSpell(spell)).setDepth(this.depth + 2));
        this.speedButton = new Button(scene, 805, middle, 54, 44, '', () => scene.toggleSpeed()).setDepth(this.depth + 2);
        this.mapButton = new Button(scene, 900, middle, 100, 44, 'World map', () => scene.leaveToMap()).setDepth(this.depth + 2);
    }

    refresh() {
        const { treasury, hoard, waveDirector, spellbook } = this.battle;
        this.goldText.setText(`Gold ${Math.floor(treasury.gold)}`);
        const lost = this.battle.gemsLost > 0 ? `  lost ${this.battle.gemsLost}` : '';
        this.gemText.setText(`Gems ${hoard.count}/${hoard.total}${lost}`);
        this.waveText.setText(`Wave ${waveDirector.waveNumber}/${waveDirector.waveCount}`);
        this.refreshManaBar(treasury);
        this.refreshCallWaveButton(waveDirector);
        spellbook.spells.forEach((spell, index) => {
            this.spellButtons[index]
                .setLabel(`${spell.title} [${spell.hotkey}]\n${spell.manaCost} mana`)
                .setEnabled(treasury.mana >= spell.manaCost || spellbook.armedSpell === spell)
                .setHighlighted(spellbook.armedSpell === spell);
        });
        this.speedButton.setLabel(`x${this.scene.speedMultiplier}`);
    }

    refreshManaBar(treasury) {
        const bar = this.manaBar;
        const ratio = treasury.mana / treasury.maxMana;
        this.manaGraphics.clear();
        this.manaGraphics.fillStyle(0x2a1f38, 1);
        this.manaGraphics.fillRect(bar.x, bar.y, bar.width, bar.height);
        this.manaGraphics.fillStyle(0x8e5cff, 1);
        this.manaGraphics.fillRect(bar.x, bar.y, bar.width * ratio, bar.height);
        this.manaGraphics.lineStyle(1, 0x8a6fb5, 1);
        this.manaGraphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
        this.manaText.setText(`Mana ${Math.floor(treasury.mana)}/${treasury.maxMana}`);
    }

    refreshCallWaveButton(waveDirector) {
        if (waveDirector.isCountingDown) {
            const verb = waveDirector.waveNumber === 0 ? 'Start' : 'Next wave';
            this.callWaveButton.setLabel(`${verb} [Space]\nin ${Math.ceil(waveDirector.countdown)}s`).setEnabled(true);
        } else if (waveDirector.isSpawning) {
            this.callWaveButton.setLabel('Heroes arriving').setEnabled(false);
        } else {
            this.callWaveButton.setLabel('Final wave sent').setEnabled(false);
        }
    }
}
