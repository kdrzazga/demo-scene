class Deck {
    constructor(cards) {
        this.cards = cards.slice();
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const swap = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = swap;
        }
    }

    draw() {
        return this.cards.length > 0 ? this.cards.pop() : null;
    }

    get remaining() {
        return this.cards.length;
    }

    get isEmpty() {
        return this.cards.length === 0;
    }
}
