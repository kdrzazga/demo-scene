class Route {
    constructor(waypoints, tileSize) {
        this.points = waypoints.map(([column, row]) => ({
            x: column * tileSize + tileSize / 2,
            y: row * tileSize + tileSize / 2
        }));
        this.segmentLengths = [];
        this.length = 0;
        for (let index = 1; index < this.points.length; index++) {
            const segmentLength = Phaser.Math.Distance.BetweenPoints(this.points[index - 1], this.points[index]);
            this.segmentLengths.push(segmentLength);
            this.length += segmentLength;
        }
    }

    get start() {
        return this.points[0];
    }

    get end() {
        return this.points[this.points.length - 1];
    }

    pointAt(distance) {
        let remaining = Phaser.Math.Clamp(distance, 0, this.length);
        for (let index = 0; index < this.segmentLengths.length; index++) {
            const segmentLength = this.segmentLengths[index];
            if (remaining <= segmentLength) {
                const from = this.points[index];
                const to = this.points[index + 1];
                const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
                return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
            }
            remaining -= segmentLength;
        }
        return { x: this.end.x, y: this.end.y };
    }
}
