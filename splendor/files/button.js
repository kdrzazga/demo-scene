class Button {
    constructor(scene, x, y, width, height, label, onClick) {
        this.onClick = onClick;
        this.enabled = true;
        this.container = scene.add.container(x, y);
        this.background = scene.add.rectangle(0, 0, width, height, 0x1f2a33).setStrokeStyle(2, 0x3a4a55);
        this.label = scene.add.text(0, 0, label, {
            fontFamily: 'monospace',
            fontSize: '17px',
            color: '#cfe8ff'
        }).setOrigin(0.5);
        this.container.add([this.background, this.label]);
        this.background.setInteractive({ useHandCursor: true });
        this.background.on('pointerdown', () => {
            if (this.enabled) {
                this.onClick();
            }
        });
        this.background.on('pointerover', () => {
            if (this.enabled) {
                this.background.setFillStyle(0x2b3b47);
            }
        });
        this.background.on('pointerout', () => this._paint());
    }

    _paint() {
        this.background.setFillStyle(this.enabled ? 0x1f2a33 : 0x151b20);
        this.label.setColor(this.enabled ? '#cfe8ff' : '#5a646c');
    }

    setEnabled(value) {
        this.enabled = value;
        this._paint();
        return this;
    }

    setLabel(text) {
        this.label.setText(text);
        return this;
    }

    setVisible(value) {
        this.container.setVisible(value);
        return this;
    }
}
