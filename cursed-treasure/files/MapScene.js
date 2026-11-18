class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
    }

    create() {
        const levelCatalog = this.registry.get('levelCatalog');
        const progress = this.registry.get('progress');
        const { width, height } = this.scale;
        this.add.rectangle(0, 0, width, height, 0x150f1c).setOrigin(0);
        this.paintLandscape(levelCatalog.levels);
        this.add.text(width / 2, 56, 'HOARDKEEPER', {
            fontFamily: 'monospace',
            fontSize: '44px',
            color: '#e6c8ff',
            stroke: '#3a1f55',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.add.text(width / 2, 100, 'Heroes are coming for your gems. Keep every last one.', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#b9a6cc'
        }).setOrigin(0.5);
        this.paintTrail(levelCatalog.levels);
        levelCatalog.levels.forEach((level, index) => this.createLevelNode(level, index, progress));
        new Button(this, width / 2, 460, 280, 40, `Dark Pacts  (${progress.freePoints} free)`, () => this.scene.start('PactScene'));
        this.add.text(width / 2, 560, [
            'Click meadow, tundra or ashland to raise the tower that belongs there. Click a tower to upgrade or sell.',
            'Heroes grab gems and run home. Kill a carrier and the gem rolls back to your hoard.',
            'Q Meteor   W Dread   E Clearcut   Space next wave   Esc / right-click cancel'
        ].join('\n'), {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8f7fa3',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);
    }

    paintLandscape(levels) {
        const graphics = this.add.graphics();
        const tints = [0x2c5a22, 0x5d7c8c, 0x6e3020];
        levels.forEach((level, index) => {
            graphics.fillStyle(tints[index % tints.length], 0.35);
            graphics.fillEllipse(level.mapPosition.x, level.mapPosition.y + 20, 300, 200);
        });
    }

    paintTrail(levels) {
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0x5b3f7a, 1);
        for (let index = 1; index < levels.length; index++) {
            const from = levels[index - 1].mapPosition;
            const to = levels[index].mapPosition;
            graphics.lineBetween(from.x, from.y, to.x, to.y);
        }
    }

    createLevelNode(level, index, progress) {
        const open = progress.isLevelOpen(index);
        const { x, y } = level.mapPosition;
        const label = open ? `${index + 1}. ${level.name}` : `${index + 1}. Locked`;
        new Button(this, x, y, 200, 50, label, () => this.scene.start('BattleScene', { levelIndex: index })).setEnabled(open);
        this.add.text(x, y + 42, progress.formatStars(progress.bestStars[index]), {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#ffd740'
        }).setOrigin(0.5);
        this.add.text(x, y + 80, level.subtitle, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#b9a6cc',
            align: 'center',
            wordWrap: { width: 230 }
        }).setOrigin(0.5, 0.5);
    }
}
