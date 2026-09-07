function colorHexForDie(dieColor) {
  switch (dieColor) {
    case DieColor.GREEN: return 0x5aa84f;
    case DieColor.BLUE: return 0x4f7fd0;
    case DieColor.YELLOW: return 0xd8bd45;
    case DieColor.ORANGE: return 0xd87f34;
    case DieColor.PURPLE: return 0x8a5fbf;
    case DieColor.BLACK: return 0x2f343b;
    default: return 0x555b63;
  }
}

class DieView extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options) {
    super(scene, x, y);
    const settings = options || {};
    this.dieColor = settings.dieColor;
    this.symbol = settings.symbol || null;
    this.size = settings.size || 54;
    this.faceDown = settings.faceDown || false;
    this.spell = settings.spell || false;
    this.clickHandler = settings.onClick || null;
    this.build();
  }

  build() {
    const scene = this.scene;
    const half = this.size / 2;
    const background = scene.add.rectangle(0, 0, this.size, this.size, colorHexForDie(this.dieColor));
    background.setStrokeStyle(2, this.spell ? 0xffd24a : 0x10141a);
    this.add(background);

    if (this.faceDown) {
      const mark = scene.add.text(0, 0, '?', {
        fontFamily: 'monospace', fontSize: Math.floor(this.size * 0.5) + 'px', color: '#eef2f6'
      }).setOrigin(0.5);
      this.add(mark);
    } else {
      this.drawSymbol(this.symbol);
      if (this.spell) {
        const badge = scene.add.circle(half - 8, -half + 8, 6, 0xffd24a);
        this.add(badge);
      }
    }

    this.setSize(this.size, this.size);
    if (this.clickHandler) {
      this.setInteractive(new Phaser.Geom.Rectangle(-half, -half, this.size, this.size), Phaser.Geom.Rectangle.Contains);
      this.on('pointerdown', () => this.clickHandler());
      this.on('pointerover', () => background.setStrokeStyle(3, 0xffffff));
      this.on('pointerout', () => background.setStrokeStyle(2, this.spell ? 0xffd24a : 0x10141a));
    }
  }

  drawSymbol(symbol) {
    const graphics = this.scene.add.graphics();
    const unit = this.size * 0.3;
    graphics.fillStyle(0xf6f8fb, 1);
    if (symbol === BattleSymbol.ATTACK) {
      graphics.fillRect(-2, -unit, 4, unit * 1.5);
      graphics.fillRect(-unit * 0.55, unit * 0.2, unit * 1.1, 3);
      graphics.fillRect(-2, unit * 0.2, 4, unit * 0.6);
    } else if (symbol === BattleSymbol.DEFENSE) {
      graphics.beginPath();
      graphics.moveTo(-unit, -unit * 0.9);
      graphics.lineTo(unit, -unit * 0.9);
      graphics.lineTo(unit, unit * 0.2);
      graphics.lineTo(0, unit);
      graphics.lineTo(-unit, unit * 0.2);
      graphics.closePath();
      graphics.fillPath();
    } else if (symbol === BattleSymbol.SPELL) {
      this.drawStar(graphics, unit);
    } else {
      graphics.fillStyle(0xf6f8fb, 0.3);
      graphics.fillCircle(0, 0, 4);
    }
    this.add(graphics);
  }

  drawStar(graphics, radius) {
    const spikes = 4;
    const inner = radius * 0.42;
    graphics.beginPath();
    for (let index = 0; index < spikes * 2; index++) {
      const currentRadius = index % 2 === 0 ? radius : inner;
      const angle = (Math.PI / spikes) * index - Math.PI / 2;
      const pointX = Math.cos(angle) * currentRadius;
      const pointY = Math.sin(angle) * currentRadius;
      if (index === 0) {
        graphics.moveTo(pointX, pointY);
      } else {
        graphics.lineTo(pointX, pointY);
      }
    }
    graphics.closePath();
    graphics.fillPath();
  }
}
