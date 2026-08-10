class Ruleset {

    constructor() {
        this.mapSize = 7;
        this.foodPerCitizen = 2;
        this.foodBoxBase = 10;
        this.foodBoxPerLevel = 5;
        this.contentBase = 4;
        this.luxuryPerEntertainer = 2;
        this.growthCap = 8;
        this.rushGoldPerShield = 4;
        this.startControl = 8;
        this.maxControl = 20;
        this.controlPerLevel = 2;
        this.terrains = this._buildTerrains();
    }

    _buildTerrains() {
        const list = [
            new TerrainType('meadow', 'Meadow', 2, 1, 0, 0x4caf50),
            new TerrainType('regular', 'Regular', 1, 1, 1, 0x8bc34a),
            new TerrainType('snow', 'Snow', 1, 0, 0, 0xeceff1),
            new TerrainType('desert', 'Desert', 0, 1, 0, 0xffd54f),
            new TerrainType('mountain', 'Mountain', 0, 2, 0, 0x9e9e9e),
            new TerrainType('water', 'Water', 1, 0, 2, 0x2196f3)
        ];
        const map = {};
        list.forEach(t => map[t.key] = t);
        return map;
    }

    terrainList() {
        return Object.keys(this.terrains).map(k => this.terrains[k]);
    }

    terrain(key) {
        return this.terrains[key];
    }

    randomTerrain() {
        const keys = Object.keys(this.terrains);
        return this.terrains[keys[Math.floor(Math.random() * keys.length)]];
    }

    newBuildings() {
        return [
            new Granary(),
            new Temple(),
            new Marketplace(),
            new Harbor(),
            new Aqueduct(),
            new Colosseum(),
            new Bank(),
            new Wealth()
        ];
    }

    foodNeeded(level) {
        return this.foodBoxBase + level * this.foodBoxPerLevel;
    }

    controlCapacity(level) {
        const raw = this.startControl + (level - 1) * this.controlPerLevel;
        return Math.max(this.startControl, Math.min(this.maxControl, raw));
    }
}
