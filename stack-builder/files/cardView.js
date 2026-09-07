class CardView extends Phaser.GameObjects.Container {
  constructor(scene, x, y, card, options) {
    super(scene, x, y);
    const settings = options || {};
    this.card = card;
    this.clickHandler = settings.onClick || null;
    this.dimmed = settings.dimmed || false;
    this.countLabel = settings.countLabel || null;
    this.cardWidth = 118;
    this.cardHeight = 166;
    this.build();
  }

  backgroundColor() {
    if (this.card.isTreasure()) {
      return 0xf1d27a;
    }
    if (this.card.isVictory()) {
      return 0x9ccf8f;
    }
    return 0x8fb6d9;
  }

  build() {
    const scene = this.scene;
    const background = scene.add.rectangle(0, 0, this.cardWidth, this.cardHeight, this.backgroundColor());
    background.setStrokeStyle(2, 0x11151b);
    const nameText = scene.add.text(0, -this.cardHeight / 2 + 20, this.card.name, {
      fontFamily: 'monospace', fontSize: '17px', color: '#101010'
    }).setOrigin(0.5);
    const costBadge = scene.add.circle(-this.cardWidth / 2 + 18, -this.cardHeight / 2 + 18, 14, 0x111821);
    const costText = scene.add.text(-this.cardWidth / 2 + 18, -this.cardHeight / 2 + 18, String(this.card.cost), {
      fontFamily: 'monospace', fontSize: '15px', color: '#ffd873'
    }).setOrigin(0.5);
    const typeText = scene.add.text(0, -6, this.card.type.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '11px', color: '#2a2a2a'
    }).setOrigin(0.5);
    const effectText = scene.add.text(0, this.cardHeight / 2 - 24, this.card.describe(), {
      fontFamily: 'monospace', fontSize: '13px', color: '#101010'
    }).setOrigin(0.5);
    this.add([background, nameText, costBadge, costText, typeText, effectText]);

    if (this.countLabel) {
      const count = scene.add.text(0, this.cardHeight / 2 + 16, this.countLabel, {
        fontFamily: 'monospace', fontSize: '14px', color: '#9fb2c4'
      }).setOrigin(0.5);
      this.add(count);
    }

    this.setSize(this.cardWidth, this.cardHeight);

    if (this.dimmed) {
      const overlay = scene.add.rectangle(0, 0, this.cardWidth, this.cardHeight, 0x05070a, 0.6);
      this.add(overlay);
      return;
    }

    if (this.clickHandler) {
      const hitArea = new Phaser.Geom.Rectangle(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight);
      this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      this.on('pointerdown', () => this.clickHandler());
      this.on('pointerover', () => background.setStrokeStyle(3, 0xffffff));
      this.on('pointerout', () => background.setStrokeStyle(2, 0x11151b));
    }
  }
}
