class Pile {
  constructor(cards) {
    this.cards = cards ? cards.slice() : [];
  }

  get count() {
    return this.cards.length;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  add(card) {
    this.cards.push(card);
  }

  addAll(cards) {
    for (const card of cards) {
      this.cards.push(card);
    }
  }

  drawTop() {
    return this.cards.pop();
  }

  remove(card) {
    const index = this.cards.indexOf(card);
    if (index >= 0) {
      this.cards.splice(index, 1);
    }
    return card;
  }

  takeAll() {
    const taken = this.cards;
    this.cards = [];
    return taken;
  }

  shuffle() {
    for (let index = this.cards.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temporary = this.cards[index];
      this.cards[index] = this.cards[swapIndex];
      this.cards[swapIndex] = temporary;
    }
  }

  totalVictoryPoints() {
    let total = 0;
    for (const card of this.cards) {
      total += card.victoryPoints();
    }
    return total;
  }
}
