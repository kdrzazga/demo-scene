class Building {

    constructor(key, name, cost) {
        this.key = key;
        this.name = name;
        this.cost = cost;
        this.shields = 0;
    }

    addShields(amount) {
        this.shields += amount;
    }

    isDone() {
        return this.shields >= this.cost;
    }

    progress() {
        return Math.min(1, this.shields / this.cost);
    }

    remaining() {
        return Math.max(0, this.cost - this.shields);
    }

    foodBonus(city) {
        return 0;
    }

    tradeBonus(city) {
        return 0;
    }

    goldBonus(trade) {
        return 0;
    }

    happyBonus() {
        return 0;
    }

    removesGrowthCap() {
        return false;
    }

    famineBuffer() {
        return 0;
    }

    keepsFoodOnGrowth() {
        return false;
    }

    isProcess() {
        return false;
    }

    describe() {
        return this.name;
    }
}

class Granary extends Building {

    constructor() {
        super('granary', 'Granary', 30);
    }

    famineBuffer() {
        return 3;
    }

    keepsFoodOnGrowth() {
        return true;
    }

    describe() {
        return 'Granary — softens famine, keeps food on growth';
    }
}

class Temple extends Building {

    constructor() {
        super('temple', 'Temple', 20);
    }

    happyBonus() {
        return 1;
    }

    describe() {
        return 'Temple — +1 happiness';
    }
}

class Marketplace extends Building {

    constructor() {
        super('marketplace', 'Marketplace', 40);
    }

    goldBonus(trade) {
        return Math.max(1, Math.floor(trade * 0.5));
    }

    describe() {
        return 'Marketplace — +50% trade as gold';
    }
}

class Harbor extends Building {

    constructor() {
        super('harbor', 'Harbor', 30);
    }

    foodBonus(city) {
        return city.controlledWaterTiles();
    }

    describe() {
        return 'Harbor — +1 food per water tile';
    }
}

class Aqueduct extends Building {

    constructor() {
        super('aqueduct', 'Aqueduct', 40);
    }

    removesGrowthCap() {
        return true;
    }

    describe() {
        return 'Aqueduct — grow past the size cap';
    }
}

class Colosseum extends Building {

    constructor() {
        super('colosseum', 'Colosseum', 50);
    }

    happyBonus() {
        return 2;
    }

    describe() {
        return 'Colosseum — +2 happiness';
    }
}

class Bank extends Building {

    constructor() {
        super('bank', 'Bank', 60);
    }

    goldBonus(trade) {
        return Math.floor(trade * 0.5);
    }

    describe() {
        return 'Bank — +50% trade as gold (stacks)';
    }
}

class Wealth extends Building {

    constructor() {
        super('wealth', 'Wealth', 0);
    }

    isProcess() {
        return true;
    }

    isDone() {
        return false;
    }

    applyShields(city, shields) {
        city.gold += shields;
    }

    describe() {
        return 'Wealth — turn shields into gold';
    }
}
