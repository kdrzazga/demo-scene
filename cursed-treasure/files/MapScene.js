class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
    }

    create() {
        const levelCatalog = this.registry.get('levelCatalog');
        const progress = this.registry.get('progress');
        const { width, height } = this.scale;
        const packIndex = this.choosePackIndex(levelCatalog, progress);
        const pack = levelCatalog.packs[packIndex];
        const firstLevelIndex = levelCatalog.firstLevelIndexOf(packIndex);
        this.add.rectangle(0, 0, width, height, 0x150f1c).setOrigin(0);
        this.paintLandscape(pack.levels);
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
        this.createPackSelector(levelCatalog, packIndex, progress);
        this.paintTrail(pack.levels);
        pack.levels.forEach((level, offset) => this.createLevelNode(level, firstLevelIndex + offset, progress));
        new Button(this, width / 2, 460, 280, 40, `Dark Pacts  (${progress.freePoints} free)`, () => this.scene.start('PactScene')).setDepth(10);
        this.add.text(width / 2, 560, [
            'Click meadow, tundra or ashland to raise the tower that belongs there. Click a tower to upgrade or sell.',
            'Heroes grab gems and run home. Dropped gems stay put until you cast Recall.',
            'Mines and springs are bound by 3 seals: mine seals cost 50 mana, spring seals 25 gold.',
            'Q Meteor   W Dread   E Clearcut   R Recall gems   T Armageddon   Space next wave   Esc / right-click cancel'
        ].join('\n'), {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8f7fa3',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);
    }

    choosePackIndex(levelCatalog, progress) {
        const remembered = this.registry.get('mapPackIndex');
        if (Number.isInteger(remembered)) return Phaser.Math.Clamp(remembered, 0, levelCatalog.packs.length - 1);
        let latestOpenLevel = 0;
        levelCatalog.levels.forEach((level, index) => {
            if (progress.isLevelOpen(index)) latestOpenLevel = index;
        });
        return levelCatalog.packIndexOf(latestOpenLevel);
    }

    createPackSelector(levelCatalog, packIndex, progress) {
        const middle = this.scale.width / 2;
        const top = 136;
        const packCount = levelCatalog.packs.length;
        const packOpen = progress.isLevelOpen(levelCatalog.firstLevelIndexOf(packIndex));
        const title = `Pack ${packIndex + 1}/${packCount}: ${levelCatalog.packs[packIndex].title}${packOpen ? '' : '  (locked)'}`;
        this.add.text(middle, top, title, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: packOpen ? '#ffd740' : '#7d6b8f'
        }).setOrigin(0.5);
        new Button(this, middle - 270, top, 44, 30, '<', () => this.showPack(packIndex - 1)).setEnabled(packIndex > 0);
        new Button(this, middle + 270, top, 44, 30, '>', () => this.showPack(packIndex + 1)).setEnabled(packIndex < packCount - 1);
    }

    showPack(packIndex) {
        this.registry.set('mapPackIndex', packIndex);
        this.scene.restart();
    }

    paintLandscape(levels) {
        const graphics = this.add.graphics();
        const tints = [0x2c5a22, 0x5d7c8c, 0x6e3020];
        levels.forEach(level => {
            graphics.fillStyle(tints[['meadow', 'tundra', 'ashland'].indexOf(level.base)], 0.35);
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
