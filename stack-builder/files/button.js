class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, onClick) {
    super(scene, x, y);
    this.clickHandler = onClick;
    this.labelValue = label;
    this.buttonWidth = 192;
    this.buttonHeight = 42;
    this.enabledState = true;
    this.build();
    scene.add.existing(this);
  }

  build() {
    this.background = this.scene.add.rectangle(0, 0, this.buttonWidth, this.buttonHeight, 0x2d3a4a);
    this.background.setStrokeStyle(2, 0x7fd7ff);
    this.text = this.scene.add.text(0, 0, this.labelValue, {
      fontFamily: 'monospace', fontSize: '16px', color: '#cfe8ff'
    }).setOrigin(0.5);
    this.add([this.background, this.text]);
    this.setSize(this.buttonWidth, this.buttonHeight);
    const hitArea = new Phaser.Geom.Rectangle(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.on('pointerdown', () => {
      if (this.enabledState && this.clickHandler) {
        this.clickHandler();
      }
    });
    this.on('pointerover', () => {
      if (this.enabledState) {
        this.background.setFillStyle(0x3d5066);
      }
    });
    this.on('pointerout', () => {
      if (this.enabledState) {
        this.background.setFillStyle(0x2d3a4a);
      }
    });
  }

  setEnabled(enabled) {
    this.enabledState = enabled;
    this.background.setFillStyle(enabled ? 0x2d3a4a : 0x171e26);
    this.text.setColor(enabled ? '#cfe8ff' : '#4a5560');
  }
}
