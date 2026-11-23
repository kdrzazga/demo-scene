class Battlefield {
    constructor(scene, level) {
        this.scene = scene;
        this.level = level;
        this.tileSize = 32;
        this.columns = 30;
        this.rows = 18;
        this.terrainVariantCount = 4;
        this.buildableTerrains = new Set(['meadow', 'tundra', 'ashland']);
        this.walkableTerrains = new Set(['path', 'hoard']);
        this.random = new Phaser.Math.RandomDataGenerator([level.name]);
        this.tiles = this.createBlankTiles();
        this.applyZones();
        this.applyForests();
        this.applyRocks();
        this.applySites(level.mines, 'mine');
        this.applySites(level.springs, 'spring');
        level.paths.forEach(waypoints => this.carvePath(waypoints));
        level.wideSegments.forEach(segment => this.widenSegment(segment));
        this.markHoard();
        this.routes = level.paths.map(waypoints => new Route(waypoints, this.tileSize));
        this.paint();
    }

    get pixelWidth() {
        return this.columns * this.tileSize;
    }

    get pixelHeight() {
        return this.rows * this.tileSize;
    }

    get hoardPosition() {
        return this.routes[0].end;
    }

    createBlankTiles() {
        const tiles = [];
        for (let row = 0; row < this.rows; row++) {
            const line = [];
            for (let column = 0; column < this.columns; column++) {
                line.push({
                    column,
                    row,
                    terrain: this.level.base,
                    ground: this.level.base,
                    forested: false,
                    tower: null,
                    site: null,
                    wideRoad: null,
                    forestImage: null
                });
            }
            tiles.push(line);
        }
        return tiles;
    }

    eachTile(visit) {
        this.tiles.forEach(line => line.forEach(visit));
    }

    eachTileInRect(rect, visit) {
        for (let row = rect.y; row < rect.y + rect.h; row++) {
            for (let column = rect.x; column < rect.x + rect.w; column++) {
                const tile = this.tileAt(column, row);
                if (tile) visit(tile);
            }
        }
    }

    applyZones() {
        this.level.zones.forEach(zone => this.eachTileInRect(zone, tile => {
            tile.terrain = zone.terrain;
            tile.ground = zone.terrain;
        }));
    }

    applyForests() {
        this.level.forests.forEach(rect => this.eachTileInRect(rect, tile => {
            if (this.buildableTerrains.has(tile.terrain)) tile.forested = true;
        }));
    }

    applyRocks() {
        this.level.rocks.forEach(([column, row]) => {
            const tile = this.tileAt(column, row);
            if (!tile) return;
            tile.terrain = 'rock';
            tile.forested = false;
        });
    }

    applySites(positions, terrain) {
        positions.forEach(([column, row, sealCount = 3]) => {
            const tile = this.tileAt(column, row);
            if (!tile) return;
            tile.terrain = terrain;
            tile.sealCount = sealCount;
            tile.forested = false;
        });
    }

    tilesOfTerrain(terrain) {
        return this.tiles.flat().filter(tile => tile.terrain === terrain);
    }

    carvePath(waypoints) {
        for (let index = 1; index < waypoints.length; index++) {
            const [fromColumn, fromRow] = waypoints[index - 1];
            const [toColumn, toRow] = waypoints[index];
            const columnStep = Math.sign(toColumn - fromColumn);
            const rowStep = Math.sign(toRow - fromRow);
            const stepCount = Math.max(Math.abs(toColumn - fromColumn), Math.abs(toRow - fromRow));
            for (let step = 0; step <= stepCount; step++) {
                const tile = this.tileAt(fromColumn + columnStep * step, fromRow + rowStep * step);
                if (!tile) continue;
                tile.terrain = 'path';
                tile.forested = false;
            }
        }
    }

    eachTileBetween(from, to, visit) {
        const [fromColumn, fromRow] = from;
        const [toColumn, toRow] = to;
        const columnStep = Math.sign(toColumn - fromColumn);
        const rowStep = Math.sign(toRow - fromRow);
        const stepCount = Math.max(Math.abs(toColumn - fromColumn), Math.abs(toRow - fromRow));
        for (let step = 0; step <= stepCount; step++) {
            const tile = this.tileAt(fromColumn + columnStep * step, fromRow + rowStep * step);
            if (tile) visit(tile);
        }
    }

    widenSegment(segment) {
        const [laneColumns, laneRows] = segment.lane;
        const wideRoad = { laneX: laneColumns * this.tileSize, laneY: laneRows * this.tileSize };
        this.eachTileBetween(segment.from, segment.to, tile => {
            if (!tile.wideRoad) tile.wideRoad = wideRoad;
            const laneTile = this.tileAt(tile.column + laneColumns, tile.row + laneRows);
            if (!laneTile) return;
            laneTile.terrain = 'path';
            laneTile.forested = false;
        });
    }

    wideRoadAt(x, y) {
        const tile = this.tileAtWorld(x, y);
        return tile ? tile.wideRoad : null;
    }

    markHoard() {
        const firstPath = this.level.paths[0];
        const [column, row] = firstPath[firstPath.length - 1];
        this.tileAt(column, row).terrain = 'hoard';
    }

    tileAt(column, row) {
        if (column < 0 || row < 0 || column >= this.columns || row >= this.rows) return null;
        return this.tiles[row][column];
    }

    tileAtWorld(x, y) {
        return this.tileAt(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize));
    }

    centerOf(tile) {
        return {
            x: tile.column * this.tileSize + this.tileSize / 2,
            y: tile.row * this.tileSize + this.tileSize / 2
        };
    }

    isWalkable(tile) {
        return Boolean(tile) && this.walkableTerrains.has(tile.terrain);
    }

    canBuildOn(tile) {
        return Boolean(tile) && this.buildableTerrains.has(tile.terrain) && !tile.forested && !tile.tower;
    }

    clearForest(tile) {
        if (!tile || !tile.forested) return false;
        tile.forested = false;
        tile.forestImage.destroy();
        tile.forestImage = null;
        return true;
    }

    paint() {
        this.eachTile(tile => {
            const center = this.centerOf(tile);
            const groundKey = this.isWalkable(tile) ? 'path' : tile.ground;
            const variant = this.random.between(0, this.terrainVariantCount - 1);
            this.scene.add.image(center.x, center.y, `tile-${groundKey}-${variant}`).setDepth(0);
            if (tile.terrain === 'rock') {
                this.scene.add.image(center.x, center.y, 'rock').setDepth(2);
            }
            if (tile.forested) {
                tile.forestImage = this.scene.add.image(center.x, center.y, `forest-${tile.ground}`).setDepth(3);
            }
        });
        this.paintPathEdges();
        this.routes.forEach(route => this.scene.add.image(route.start.x, route.start.y, 'gate').setDepth(4));
    }

    paintPathEdges() {
        const graphics = this.scene.add.graphics().setDepth(1);
        const edgeThickness = 2;
        graphics.fillStyle(0x5e4a2e, 0.7);
        this.eachTile(tile => {
            if (!this.isWalkable(tile)) return;
            const left = tile.column * this.tileSize;
            const top = tile.row * this.tileSize;
            const right = left + this.tileSize;
            const bottom = top + this.tileSize;
            const isOpenEdge = (column, row) => {
                const neighbor = this.tileAt(column, row);
                return neighbor !== null && !this.isWalkable(neighbor);
            };
            if (isOpenEdge(tile.column, tile.row - 1)) graphics.fillRect(left, top, this.tileSize, edgeThickness);
            if (isOpenEdge(tile.column, tile.row + 1)) graphics.fillRect(left, bottom - edgeThickness, this.tileSize, edgeThickness);
            if (isOpenEdge(tile.column - 1, tile.row)) graphics.fillRect(left, top, edgeThickness, this.tileSize);
            if (isOpenEdge(tile.column + 1, tile.row)) graphics.fillRect(right - edgeThickness, top, edgeThickness, this.tileSize);
        });
    }
}
