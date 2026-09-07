class Bank {
    constructor(gemSupply, goldSupply) {
        this.tokens = {};
        for (const gem of GEMS) {
            this.tokens[gem] = gemSupply;
        }
        this.tokens[GEM.GOLD] = goldSupply;
    }

    count(gem) {
        return this.tokens[gem];
    }

    take(gem, amount) {
        this.tokens[gem] -= amount;
    }

    give(gem, amount) {
        this.tokens[gem] += amount;
    }

    hasGold() {
        return this.tokens[GEM.GOLD] > 0;
    }

    canTakeTwo(gem) {
        return gem !== GEM.GOLD && this.tokens[gem] >= TAKE_TWO_MIN;
    }
}
