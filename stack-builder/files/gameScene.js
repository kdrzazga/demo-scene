class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.engine = new Game(STACK_CONFIG);
    this.cardLayer = this.add.container(0, 0);
    this.buildStaticUi();
    this.engine.on('changed', () => this.render());
    this.engine.on('gameOver', payload => this.showGameOver(payload));
    this.render();
  }

  buildStaticUi() {
    this.hudText = this.add.text(20, 18, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#cfe0f0', lineSpacing: 6
    });
    this.add.text(20, 100, 'SUPPLY', { fontFamily: 'monospace', fontSize: '15px', color: '#7fd7ff' });
    this.add.text(20, 346, 'IN PLAY', { fontFamily: 'monospace', fontSize: '15px', color: '#7fd7ff' });
    this.add.text(20, 548, 'HAND', { fontFamily: 'monospace', fontSize: '15px', color: '#7fd7ff' });
    const buttonRowY = 40;
    this.endActionsButton = new Button(this, 586, buttonRowY, 'End Actions', () => this.engine.endActionPhase());
    this.playTreasuresButton = new Button(this, 796, buttonRowY, 'Play Treasures', () => this.engine.playAllTreasures());
    this.endTurnButton = new Button(this, 1006, buttonRowY, 'End Turn', () => this.engine.endTurn());
  }

  render() {
    this.cardLayer.removeAll(true);
    this.renderSupply();
    this.renderPlayArea();
    this.renderPiles();
    this.renderHand();
    this.updateHud();
    this.updateButtons();
  }

  renderSupply() {
    const stacks = this.engine.supply.stacks;
    const startX = 90;
    const step = 158;
    const y = 200;
    for (let index = 0; index < stacks.length; index++) {
      const stack = stacks[index];
      const view = new CardView(this, startX + index * step, y, stack.sampleCard, {
        onClick: () => this.engine.buyCard(stack),
        dimmed: !this.engine.canBuy(stack),
        countLabel: 'x' + stack.count
      });
      this.cardLayer.add(view);
    }
  }

  renderPlayArea() {
    const cards = this.engine.player.playArea.cards;
    const startX = 130;
    const step = 54;
    const y = 430;
    for (let index = 0; index < cards.length; index++) {
      const view = new CardView(this, startX + index * step, y, cards[index], {});
      view.setScale(0.7);
      this.cardLayer.add(view);
    }
  }

  renderPiles() {
    const drawRect = this.add.rectangle(1000, 430, 104, 148, 0x1a222c).setStrokeStyle(2, 0x33414f);
    const drawText = this.add.text(1000, 430, 'DRAW\n' + this.engine.player.drawPile.count, {
      fontFamily: 'monospace', fontSize: '15px', color: '#9fb2c4', align: 'center'
    }).setOrigin(0.5);
    const discardRect = this.add.rectangle(1120, 430, 104, 148, 0x1a222c).setStrokeStyle(2, 0x33414f);
    const discardText = this.add.text(1120, 430, 'DISCARD\n' + this.engine.player.discardPile.count, {
      fontFamily: 'monospace', fontSize: '13px', color: '#9fb2c4', align: 'center'
    }).setOrigin(0.5);
    this.cardLayer.add(drawRect);
    this.cardLayer.add(drawText);
    this.cardLayer.add(discardRect);
    this.cardLayer.add(discardText);
  }

  renderHand() {
    const cards = this.engine.player.hand.cards;
    const step = 150;
    const y = 662;
    const startX = 520 - ((cards.length - 1) * step) / 2;
    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];
      const view = new CardView(this, startX + index * step, y, card, {
        onClick: () => this.engine.playCard(card),
        dimmed: !this.engine.canPlay(card)
      });
      this.cardLayer.add(view);
    }
  }

  updateHud() {
    const player = this.engine.player;
    const lines = [
      'Turn ' + this.engine.turn + '        Phase: ' + this.engine.phase.toUpperCase(),
      'Actions: ' + player.actions + '     Power: ' + player.purchasingPower + '     Buys: ' + player.numberOfBuys
    ];
    this.hudText.setText(lines.join('\n'));
  }

  updateButtons() {
    const inAction = this.engine.phase === Phase.ACTION && !this.engine.finished;
    const inBuy = this.engine.phase === Phase.BUY && !this.engine.finished;
    const hasTreasure = this.engine.player.hand.cards.some(card => card.isTreasure());
    this.endActionsButton.setEnabled(inAction);
    this.playTreasuresButton.setEnabled(inBuy && hasTreasure);
    this.endTurnButton.setEnabled(!this.engine.finished);
  }

  showGameOver(payload) {
    this.add.rectangle(600, 400, 1200, 800, 0x05070a, 0.82);
    this.add.text(600, 400, 'GAME OVER\nScore: ' + payload.score + ' VP\nTurns: ' + payload.turns, {
      fontFamily: 'monospace', fontSize: '32px', color: '#ffe6a0', align: 'center'
    }).setOrigin(0.5);
  }
}
