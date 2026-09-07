class Game extends Emitter {
  constructor(config) {
    super();
    this.config = config;
    this.factory = config.factory;
    this.player = new Player(this.buildStartingCards());
    this.supply = this.buildSupply();
    this.turn = 1;
    this.finished = false;
    this.resetTurnResources();
    this.player.drawCards(this.config.handSize);
    this.phase = this.phaseForNewHand();
  }

  buildStartingCards() {
    const cards = [];
    for (const entry of this.config.startingDeck) {
      for (let index = 0; index < entry.count; index++) {
        cards.push(this.factory.create(entry.name));
      }
    }
    return cards;
  }

  buildSupply() {
    const stacks = [];
    for (const entry of this.config.supply) {
      stacks.push(new SupplyStack(this.factory.create(entry.name), entry.count));
    }
    return new Supply(stacks);
  }

  resetTurnResources() {
    this.player.actions = this.config.startingActions;
    this.player.purchasingPower = this.config.startingPurchasingPower;
    this.player.numberOfBuys = this.config.startingBuys;
  }

  phaseForNewHand() {
    if (this.player.actions < 1) {
      return Phase.BUY;
    }
    const hasPlayableAction = this.player.hand.cards.some(card => card.isAction());
    return hasPlayableAction ? Phase.ACTION : Phase.BUY;
  }

  addActions(amount) {
    this.player.actions += amount;
  }

  addPurchasingPower(amount) {
    this.player.purchasingPower += amount;
  }

  addBuys(amount) {
    this.player.numberOfBuys += amount;
  }

  canPlay(card) {
    if (this.finished) {
      return false;
    }
    if (!this.player.hand.cards.includes(card)) {
      return false;
    }
    if (!card.playableDuring(this.phase)) {
      return false;
    }
    if (card.isAction() && this.player.actions < 1) {
      return false;
    }
    return true;
  }

  playCard(card) {
    if (!this.canPlay(card)) {
      return false;
    }
    this.player.moveToPlayArea(card);
    if (card.isAction()) {
      this.player.actions -= 1;
    }
    card.play(this);
    if (this.phase === Phase.ACTION && this.player.actions === 0) {
      this.phase = Phase.BUY;
    }
    this.emit('changed');
    return true;
  }

  playAllTreasures() {
    if (this.finished || this.phase !== Phase.BUY) {
      return;
    }
    const treasures = this.player.hand.cards.filter(card => card.isTreasure());
    for (const treasure of treasures) {
      this.player.moveToPlayArea(treasure);
      treasure.play(this);
    }
    this.emit('changed');
  }

  canBuy(stack) {
    if (this.finished) {
      return false;
    }
    if (this.phase !== Phase.BUY) {
      return false;
    }
    if (stack.isEmpty()) {
      return false;
    }
    if (this.player.numberOfBuys < 1) {
      return false;
    }
    return stack.cost <= this.player.purchasingPower;
  }

  buyCard(stack) {
    if (!this.canBuy(stack)) {
      return false;
    }
    stack.count -= 1;
    this.player.numberOfBuys -= 1;
    this.player.purchasingPower -= stack.cost;
    this.player.discardPile.add(this.factory.create(stack.name));
    this.emit('changed');
    this.checkGameEnd();
    return true;
  }

  endActionPhase() {
    if (this.finished || this.phase !== Phase.ACTION) {
      return;
    }
    this.phase = Phase.BUY;
    this.emit('changed');
  }

  endTurn() {
    if (this.finished) {
      return;
    }
    this.player.discardHandAndPlayArea();
    this.resetTurnResources();
    this.player.drawCards(this.config.handSize);
    this.turn += 1;
    this.phase = this.phaseForNewHand();
    this.emit('changed');
  }

  checkGameEnd() {
    const province = this.supply.stackByName('Province');
    const provinceEmpty = province && province.isEmpty();
    const threePilesEmpty = this.supply.emptyStackCount() >= 3;
    if (provinceEmpty || threePilesEmpty) {
      this.finished = true;
      this.emit('gameOver', { score: this.player.totalVictoryPoints(), turns: this.turn });
    }
  }
}
