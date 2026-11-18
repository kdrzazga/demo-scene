class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        this.levelIndex = data.levelIndex;
        this.speedMultiplier = 1;
        this.maxFrameSeconds = 0.05;
        this.resultShown = false;
    }

    create() {
        const levelCatalog = this.registry.get('levelCatalog');
        const progress = this.registry.get('progress');
        this.levelCatalog = levelCatalog;
        this.battle = new Battle(this, levelCatalog.levels[this.levelIndex], this.levelIndex, progress);
        this.hud = new Hud(this, this.battle);
        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', (pointer, objectsUnderPointer) => {
            if (objectsUnderPointer.length === 0) this.battle.handlePointerDown(pointer);
        });
        this.bindKeys();
    }

    bindKeys() {
        const keyboard = this.input.keyboard;
        this.battle.spellbook.spells.forEach(spell => {
            keyboard.on(`keydown-${spell.hotkey}`, () => this.battle.toggleSpell(spell));
        });
        keyboard.on('keydown-SPACE', () => this.battle.callWave());
        keyboard.on('keydown-ESC', () => this.battle.cancelSelection());
    }

    update(time, delta) {
        const dt = Math.min(delta / 1000, this.maxFrameSeconds) * this.speedMultiplier;
        this.battle.update(dt);
        this.hud.refresh();
        if (this.battle.outcome && !this.resultShown) this.showResult();
    }

    toggleSpeed() {
        this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
    }

    leaveToMap() {
        this.scene.start('MapScene');
    }

    showResult() {
        this.resultShown = true;
        const { width, height } = this.scale;
        const depth = 2000;
        const victory = this.battle.outcome === 'victory';
        const progress = this.registry.get('progress');
        this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0).setDepth(depth).setInteractive();
        this.add.rectangle(width / 2, height / 2, 460, 260, 0x1d1428, 0.97).setStrokeStyle(2, 0x8a6fb5).setDepth(depth);
        this.add.text(width / 2, height / 2 - 90, victory ? 'The hoard endures!' : 'The hoard is plundered...', {
            fontFamily: 'monospace',
            fontSize: '26px',
            color: victory ? '#e6c8ff' : '#ff8a80'
        }).setOrigin(0.5).setDepth(depth + 1);
        const summary = victory
            ? `${progress.formatStars(this.battle.starsEarned)}\nGems kept ${this.battle.savedGems}/${this.battle.hoard.total}`
            : 'Every gem was carried off.';
        this.add.text(width / 2, height / 2 - 30, summary, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffd740',
            align: 'center'
        }).setOrigin(0.5).setDepth(depth + 1);
        const hasNextLevel = victory && this.levelIndex + 1 < this.levelCatalog.levels.length;
        const buttonY = height / 2 + 70;
        new Button(this, width / 2 - 140, buttonY, 120, 40, 'Retry', () => this.scene.restart({ levelIndex: this.levelIndex })).setDepth(depth + 2);
        new Button(this, width / 2, buttonY, 120, 40, 'World map', () => this.leaveToMap()).setDepth(depth + 2);
        new Button(this, width / 2 + 140, buttonY, 120, 40, 'Next level', () => this.scene.restart({ levelIndex: this.levelIndex + 1 }))
            .setDepth(depth + 2)
            .setEnabled(hasNextLevel);
    }
}
