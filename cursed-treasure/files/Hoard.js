class Hoard {
    constructor(scene, position, total) {
        this.total = total;
        this.count = total;
        this.image = scene.add.image(position.x, position.y + 8, 'hoard').setOrigin(0.5, 0.75).setDepth(100 + position.y);
        this.icon = scene.add.image(position.x - 10, position.y - 34, 'gem').setDepth(950);
        this.label = scene.add.text(position.x - 2, position.y - 34, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setDepth(950);
        this.refreshLabel();
    }

    takeGems(requested) {
        const taken = Math.min(requested, this.count);
        this.count -= taken;
        this.refreshLabel();
        return taken;
    }

    returnGems(amount) {
        this.count += amount;
        this.refreshLabel();
    }

    refreshLabel() {
        this.label.setText(`${this.count}`);
    }
}
