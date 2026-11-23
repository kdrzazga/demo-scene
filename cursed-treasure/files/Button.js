class Button {
    constructor(scene, x, y, width, height, label, onClick) {
        this.enabled = true;
        this.highlighted = false;
        this.hovered = false;
        this.colors = {
            idle: 0x2a2233,
            hover: 0x3d3150,
            highlighted: 0x6b3fa0,
            disabled: 0x1a1620,
            border: 0x8a6fb5
        };
        this.background = scene.add.rectangle(x, y, width, height, this.colors.idle)
            .setStrokeStyle(1, this.colors.border)
            .setInteractive({ useHandCursor: true });
        this.text = scene.add.text(x, y, label, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#f0e6ff',
            align: 'center',
            wordWrap: { width: width - 12 }
        }).setOrigin(0.5);
        this.background.on('pointerover', () => {
            this.hovered = true;
            this.repaint();
        });
        this.background.on('pointerout', () => {
            this.hovered = false;
            this.repaint();
        });
        this.background.on('pointerdown', pointer => {
            if (pointer.rightButtonDown() || !this.enabled) return;
            onClick();
        });
    }

    setLabel(label) {
        this.text.setText(label);
        return this;
    }

    setEnabled(enabled) {
        if (this.enabled === enabled) return this;
        this.enabled = enabled;
        this.text.setAlpha(enabled ? 1 : 0.45);
        this.repaint();
        return this;
    }

    setHighlighted(highlighted) {
        if (this.highlighted === highlighted) return this;
        this.highlighted = highlighted;
        this.repaint();
        return this;
    }

    setDepth(depth) {
        this.background.setDepth(depth);
        this.text.setDepth(depth + 1);
        return this;
    }

    repaint() {
        let color = this.colors.idle;
        if (!this.enabled) color = this.colors.disabled;
        else if (this.highlighted) color = this.colors.highlighted;
        else if (this.hovered) color = this.colors.hover;
        this.background.setFillStyle(color);
    }

    destroy() {
        this.background.destroy();
        this.text.destroy();
    }
}
