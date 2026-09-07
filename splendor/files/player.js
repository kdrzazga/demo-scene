class Player {
    constructor(name) {
        this.name = name;
        this.tokens = {};
        for (const gem of GEMS_WITH_GOLD) {
            this.tokens[gem] = 0;
        }
        this.cards = [];
        this.reserved = [];
        this.nobles = [];
    }

    bonus(gem) {
        let total = 0;
        for (const card of this.cards) {
            if (card.gem === gem) {
                total++;
            }
        }
        return total;
    }

    get prestige() {
        let points = 0;
        for (const card of this.cards) {
            points += card.points;
        }
        for (const noble of this.nobles) {
            points += noble.points;
        }
        return points;
    }

    get tokenCount() {
        let total = 0;
        for (const gem of GEMS_WITH_GOLD) {
            total += this.tokens[gem];
        }
        return total;
    }

    addToken(gem, amount) {
        this.tokens[gem] += amount;
    }

    removeToken(gem, amount) {
        this.tokens[gem] -= amount;
    }

    paymentFor(card) {
        const plan = {};
        let goldNeeded = 0;
        for (const gem of GEMS) {
            const owed = Math.max(0, card.costOf(gem) - this.bonus(gem));
            const paid = Math.min(owed, this.tokens[gem]);
            plan[gem] = paid;
            goldNeeded += owed - paid;
        }
        plan[GEM.GOLD] = goldNeeded;
        return plan;
    }

    canAfford(card) {
        return this.paymentFor(card)[GEM.GOLD] <= this.tokens[GEM.GOLD];
    }

    canReserveMore() {
        return this.reserved.length < MAX_RESERVED;
    }

    holdsReserved(card) {
        return this.reserved.indexOf(card) >= 0;
    }
}
