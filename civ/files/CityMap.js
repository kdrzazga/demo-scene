class CityMap {

    constructor(ruleset, chosenKey) {
        this.ruleset = ruleset;
        this.size = ruleset.mapSize;
        this.center = Math.floor(this.size / 2);
        this.grid = this._generate(chosenKey);
        this.order = this._controlOrder();
    }

    _generate(chosenKey) {
        const chosen = this.ruleset.terrain(chosenKey);
        const total = this.size * this.size;
        const positions = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                positions.push({ x, y });
            }
        }
        Phaser.Utils.Array.Shuffle(positions);
        const half = Math.round(total * 0.5);
        const grid = [];
        for (let y = 0; y < this.size; y++) {
            grid.push(new Array(this.size));
        }
        positions.forEach((p, i) => {
            const terrain = i < half ? chosen : this.ruleset.randomTerrain();
            grid[p.y][p.x] = new Tile(p.x, p.y, terrain);
        });
        grid[this.center][this.center].terrain = chosen;
        return grid;
    }

    _controlOrder() {
        const offsets = [];
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx === 0 && dy === 0) continue;
                if (Math.abs(dx) === 2 && Math.abs(dy) === 2) continue;
                offsets.push({ dx, dy });
            }
        }
        offsets.sort((a, b) => (a.dx * a.dx + a.dy * a.dy) - (b.dx * b.dx + b.dy * b.dy));
        return offsets;
    }

    tileAt(x, y) {
        if (x < 0 || y < 0 || x >= this.size || y >= this.size) return null;
        return this.grid[y][x];
    }

    centerTile() {
        return this.grid[this.center][this.center];
    }

    controlledTiles(level) {
        const cap = this.ruleset.controlCapacity(level);
        const tiles = [];
        for (let i = 0; i < this.order.length && tiles.length < cap; i++) {
            const t = this.tileAt(this.center + this.order[i].dx, this.center + this.order[i].dy);
            if (t) tiles.push(t);
        }
        return tiles;
    }
}
