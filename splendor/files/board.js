class Board {
    constructor(setup) {
        this.rowSize = setup.rowSize;
        const allCards = buildDevelopmentCards();
        this.decks = {
            1: new Deck(allCards.filter(card => card.level === 1)),
            2: new Deck(allCards.filter(card => card.level === 2)),
            3: new Deck(allCards.filter(card => card.level === 3))
        };
        this.rows = { 1: [], 2: [], 3: [] };
        for (const level of [1, 2, 3]) {
            for (let slot = 0; slot < this.rowSize; slot++) {
                this.rows[level].push(this.decks[level].draw());
            }
        }
        this.bank = new Bank(setup.gemSupply, setup.goldSupply);
        this.nobles = this._pickNobles(setup.nobleCount);
    }

    _pickNobles(amount) {
        const pool = buildNobles();
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const swap = pool[i];
            pool[i] = pool[j];
            pool[j] = swap;
        }
        return pool.slice(0, amount);
    }

    locate(card) {
        for (const level of [1, 2, 3]) {
            const slot = this.rows[level].indexOf(card);
            if (slot >= 0) {
                return { level, slot };
            }
        }
        return null;
    }

    replaceAt(level, slot) {
        this.rows[level][slot] = this.decks[level].draw();
    }

    removeNoble(noble) {
        const index = this.nobles.indexOf(noble);
        if (index >= 0) {
            this.nobles.splice(index, 1);
        }
    }
}
