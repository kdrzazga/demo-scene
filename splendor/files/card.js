class Card {
    constructor(level, gem, points, cost) {
        this.level = level;
        this.gem = gem;
        this.points = points;
        this.cost = cost;
    }

    costOf(gem) {
        return this.cost[gem] || 0;
    }
}
