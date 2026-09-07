class Player {
  constructor(startingCards) {
    this.drawPile = new Pile(startingCards);
    this.hand = new Pile();
    this.discardPile = new Pile();
    this.playArea = new Pile();
    this.actions = 0;
    this.purchasingPower = 0;
    this.numberOfBuys = 0;
    this.drawPile.shuffle();
  }

  reshuffleDiscardIntoDraw() {
    const returned = this.discardPile.takeAll();
    this.drawPile.addAll(returned);
    this.drawPile.shuffle();
  }

  drawOne() {
    if (this.drawPile.isEmpty()) {
      this.reshuffleDiscardIntoDraw();
    }
    if (this.drawPile.isEmpty()) {
      return null;
    }
    const card = this.drawPile.drawTop();
    this.hand.add(card);
    return card;
  }

  drawCards(amount) {
    const drawn = [];
    for (let index = 0; index < amount; index++) {
      const card = this.drawOne();
      if (!card) {
        break;
      }
      drawn.push(card);
    }
    return drawn;
  }

  moveToPlayArea(card) {
    this.hand.remove(card);
    this.playArea.add(card);
  }

  discardHandAndPlayArea() {
    this.discardPile.addAll(this.hand.takeAll());
    this.discardPile.addAll(this.playArea.takeAll());
  }

  totalVictoryPoints() {
    return this.drawPile.totalVictoryPoints()
      + this.hand.totalVictoryPoints()
      + this.discardPile.totalVictoryPoints()
      + this.playArea.totalVictoryPoints();
  }
}
