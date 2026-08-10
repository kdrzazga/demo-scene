class TerrainType {

    constructor(key, name, food, shields, trade, color) {
        this.key = key;
        this.name = name;
        this.food = food;
        this.shields = shields;
        this.trade = trade;
        this.color = color;
    }

    cssColor() {
        return '#' + this.color.toString(16).padStart(6, '0');
    }
}
