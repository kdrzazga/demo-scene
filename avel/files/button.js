class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, onClick, options) {
    super(scene, x, y);
    const settings = options || {};
    this.label = label;
    this.clickHandler = onClick;
    this.buttonWidth = settings.width || 150;
    this.buttonHeight = settings.height || 40;
    this.enabledState = settings.enabled !== undefined ? settings.enabled : true;
    this.build();
  }

  build() {
    const scene = this.scene;
    this.background = scene.add.rectangle(0, 0, this.buttonWidth, this.buttonHeight, this.enabledState ? 0x2d3a4a : 0x1a2028);
    this.background.setStrokeStyle(2, this.enabledState ? 0x7fd7ff : 0x39434d);
    this.text = scene.add.text(0, 0, this.label, {
      fontFamily: 'monospace', fontSize: '15px', color: this.enabledState ? '#cfe8ff' : '#54606b'
    }).setOrigin(0.5);
    this.add([this.background, this.text]);
    this.setSize(this.buttonWidth, this.buttonHeight);
    if (this.enabledState && this.clickHandler) {
      const half = new Phaser.Geom.Rectangle(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight);
      this.setInteractive(half, Phaser.Geom.Rectangle.Contains);
      this.on('pointerdown', () => this.clickHandler());
      this.on('pointerover', () => this.background.setFillStyle(0x3d5066));
      this.on('pointerout', () => this.background.setFillStyle(0x2d3a4a));
    }
  }
}
