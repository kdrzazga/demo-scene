class CityScene extends Phaser.Scene {

    constructor() {
        super('city');
        this.tileSize = 66;
        this.rects = [];
    }

    init(data) {
        this.terrainKey = data.terrainKey || 'meadow';
    }

    create() {
        this.ruleset = this.registry.get('ruleset');
        this.map = new CityMap(this.ruleset, this.terrainKey);
        this.city = new City(this.ruleset, this.map);
        this.hud = new Hud(this);
        this._drawGrid();
        this.redraw();
    }

    _drawGrid() {
        const size = this.map.size;
        const board = size * this.tileSize;
        this.offsetX = (this.scale.width - board) / 2;
        this.offsetY = (this.scale.height - board) / 2;
        this.rects = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                const tile = this.map.tileAt(x, y);
                const px = this.offsetX + x * this.tileSize + this.tileSize / 2;
                const py = this.offsetY + y * this.tileSize + this.tileSize / 2;
                row.push(this.add.rectangle(px, py, this.tileSize - 2, this.tileSize - 2, tile.terrain.color));
            }
            this.rects.push(row);
        }
        const c = this.map.center;
        const cx = this.offsetX + c * this.tileSize + this.tileSize / 2;
        const cy = this.offsetY + c * this.tileSize + this.tileSize / 2;
        this.add.star(cx, cy, 5, 9, 20, 0xffffff).setStrokeStyle(2, 0x11191f);
    }

    redraw() {
        const controlled = new Set();
        this.map.controlledTiles(this.city.level).forEach(t => controlled.add(t.x + ',' + t.y));
        const c = this.map.center;
        for (let y = 0; y < this.map.size; y++) {
            for (let x = 0; x < this.map.size; x++) {
                const rect = this.rects[y][x];
                if (x === c && y === c) {
                    rect.setAlpha(1).setStrokeStyle(3, 0xffeb3b);
                } else if (controlled.has(x + ',' + y)) {
                    rect.setAlpha(1).setStrokeStyle(2, 0xffffff);
                } else {
                    rect.setAlpha(0.3).setStrokeStyle(1, 0x11191f);
                }
            }
        }
        this.hud.render(this.city);
    }

    chooseBuilding(key) {
        this.city.setConstruction(key);
        this.redraw();
    }

    setEntertainers(n) {
        this.city.setEntertainers(n);
        this.redraw();
    }

    endTurn() {
        this.city.processTurn();
        this.redraw();
    }

    rush() {
        if (this.city.rush()) this.redraw();
    }
}
