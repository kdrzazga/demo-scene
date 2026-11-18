class TileMenu {
    constructor(battle) {
        this.battle = battle;
        this.scene = battle.scene;
        this.width = 230;
        this.entryHeight = 30;
        this.entryGap = 4;
        this.padding = 8;
        this.offsetFromTile = 24;
        this.depth = 1000;
        this.tile = null;
        this.blueprint = null;
        this.parts = [];
        this.entries = [];
    }

    get isOpen() {
        return this.tile !== null;
    }

    openForBuild(tile, blueprint) {
        const treasury = this.battle.treasury;
        this.open(tile, `${blueprint.title}\nDamage ${Math.round(blueprint.damage)}  Range ${Math.round(blueprint.range)}`, [
            {
                label: () => `Build  ${blueprint.cost}g`,
                isEnabled: () => treasury.gold >= blueprint.cost,
                action: () => this.battle.buildTower(tile, blueprint)
            }
        ]);
        this.blueprint = blueprint;
    }

    openForTower(tile, tower) {
        const treasury = this.battle.treasury;
        this.open(tile, tower.describeStats(), [
            {
                label: () => tower.canUpgrade ? `Upgrade  ${tower.upgradeCost}g` : 'Fully upgraded',
                isEnabled: () => tower.canUpgrade && treasury.gold >= tower.upgradeCost,
                action: () => this.battle.upgradeTower(tower)
            },
            {
                label: () => `Sell  +${tower.sellValue}g`,
                isEnabled: () => true,
                action: () => this.battle.sellTower(tower)
            }
        ]);
    }

    openForSite(tile, site) {
        const entries = site.isOpen ? [] : [
            {
                label: () => `Break seal  ${site.sealPriceLabel}`,
                isEnabled: () => site.canAffordSeal(),
                action: () => this.battle.breakSeal(site)
            }
        ];
        this.open(tile, site.describeStatus(), entries);
    }

    open(tile, heading, entries) {
        this.close();
        this.tile = tile;
        const battlefield = this.battle.battlefield;
        const center = battlefield.centerOf(tile);
        const headingText = this.scene.add.text(0, 0, heading, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e8dcf5',
            lineSpacing: 2
        }).setDepth(this.depth + 1);
        const panelHeight = this.padding * 3 + headingText.height + entries.length * (this.entryHeight + this.entryGap);
        let left = center.x + this.offsetFromTile;
        if (left + this.width > battlefield.pixelWidth) left = center.x - this.offsetFromTile - this.width;
        const top = Phaser.Math.Clamp(center.y - panelHeight / 2, 4, battlefield.pixelHeight - panelHeight - 4);
        const panel = this.scene.add.rectangle(left, top, this.width, panelHeight, 0x1d1428, 0.94)
            .setOrigin(0)
            .setStrokeStyle(1, 0x8a6fb5)
            .setDepth(this.depth)
            .setInteractive();
        headingText.setPosition(left + this.padding, top + this.padding);
        let entryTop = top + this.padding * 2 + headingText.height;
        this.entries = entries.map(entry => {
            const button = new Button(
                this.scene,
                left + this.width / 2,
                entryTop + this.entryHeight / 2,
                this.width - this.padding * 2,
                this.entryHeight,
                entry.label(),
                entry.action
            ).setDepth(this.depth + 2);
            entryTop += this.entryHeight + this.entryGap;
            return { entry, button };
        });
        this.parts = [panel, headingText];
        this.refresh();
    }

    refresh() {
        this.entries.forEach(({ entry, button }) => {
            button.setLabel(entry.label());
            button.setEnabled(entry.isEnabled());
        });
    }

    previewRange() {
        if (!this.tile) return 0;
        if (this.tile.tower) return this.tile.tower.range;
        return this.blueprint ? this.blueprint.range : 0;
    }

    close() {
        this.parts.forEach(part => part.destroy());
        this.entries.forEach(({ button }) => button.destroy());
        this.parts = [];
        this.entries = [];
        this.tile = null;
        this.blueprint = null;
    }
}
