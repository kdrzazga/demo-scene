class LevelCatalog {
    constructor() {
        this.levels = [this.mossyHollow(), this.frostfangPass(), this.cinderReach()];
    }

    group(enemy, count, interval, spawn = 0, delay = 0) {
        return { enemy, count, interval, spawn, delay };
    }

    mossyHollow() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Mossy Hollow',
            subtitle: 'A lone road winds to your cave. Farmers smell gold.',
            mapPosition: { x: 200, y: 250 },
            base: 'meadow',
            zones: [
                { terrain: 'tundra', x: 8, y: 5, w: 6, h: 6 },
                { terrain: 'ashland', x: 15, y: 7, w: 6, h: 3 },
                { terrain: 'ashland', x: 23, y: 7, w: 5, h: 6 }
            ],
            forests: [
                { x: 0, y: 12, w: 6, h: 6 },
                { x: 15, y: 0, w: 6, h: 3 },
                { x: 9, y: 8, w: 3, h: 2 },
                { x: 24, y: 15, w: 6, h: 3 },
                { x: 0, y: 0, w: 4, h: 2 },
                { x: 16, y: 14, w: 5, h: 4 }
            ],
            rocks: [[3, 8], [11, 2], [19, 12], [27, 3], [12, 15]],
            paths: [
                [[0, 4], [7, 4], [7, 11], [14, 11], [14, 6], [22, 6], [22, 13], [27, 13]]
            ],
            gems: 20,
            startingGold: 200,
            startingMana: 40,
            healthScale: 1,
            waves: [
                [squad('peasant', 6, 1.3)],
                [squad('peasant', 9, 1.0)],
                [squad('peasant', 5, 1.0), squad('squire', 3, 1.8, 0, 5)],
                [squad('ranger', 6, 0.9)],
                [squad('squire', 6, 1.3), squad('cleric', 1, 1, 0, 4)],
                [squad('peasant', 10, 0.6), squad('ranger', 5, 0.8, 0, 7)],
                [squad('paladin', 2, 3.5), squad('squire', 5, 1.2, 0, 2)],
                [squad('squire', 6, 1.0), squad('cleric', 2, 3, 0, 3), squad('paladin', 3, 2.5, 0, 9)]
            ]
        };
    }

    frostfangPass() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Frostfang Pass',
            subtitle: 'Two mountain trails meet at your door.',
            mapPosition: { x: 480, y: 190 },
            base: 'tundra',
            zones: [
                { terrain: 'meadow', x: 11, y: 3, w: 8, h: 5 },
                { terrain: 'ashland', x: 11, y: 9, w: 9, h: 4 },
                { terrain: 'meadow', x: 3, y: 4, w: 6, h: 4 },
                { terrain: 'ashland', x: 3, y: 10, w: 6, h: 4 },
                { terrain: 'ashland', x: 21, y: 9, w: 5, h: 4 }
            ],
            forests: [
                { x: 22, y: 2, w: 7, h: 4 },
                { x: 11, y: 14, w: 7, h: 4 },
                { x: 0, y: 6, w: 3, h: 5 },
                { x: 14, y: 4, w: 3, h: 2 },
                { x: 22, y: 15, w: 3, h: 3 }
            ],
            rocks: [[16, 1], [25, 7], [5, 16], [28, 11], [2, 0]],
            paths: [
                [[0, 2], [10, 2], [10, 8], [20, 8], [20, 14], [26, 14]],
                [[0, 15], [10, 15], [10, 8], [20, 8], [20, 14], [26, 14]]
            ],
            gems: 20,
            startingGold: 240,
            startingMana: 40,
            healthScale: 1.2,
            waves: [
                [squad('peasant', 6, 1.2, 0), squad('peasant', 6, 1.2, 1, 3)],
                [squad('squire', 4, 1.5, 0), squad('ranger', 4, 1.0, 1, 2)],
                [squad('peasant', 12, 0.7, 1), squad('cleric', 1, 1, 1, 6)],
                [squad('ranger', 7, 0.8, 0), squad('ranger', 7, 0.8, 1, 4)],
                [squad('squire', 6, 1.1, 0), squad('cleric', 2, 2.5, 0, 3), squad('paladin', 1, 1, 1, 5)],
                [squad('paladin', 3, 3, 1), squad('peasant', 10, 0.6, 0, 2)],
                [squad('ranger', 10, 0.6, 0), squad('squire', 6, 1.0, 1, 3)],
                [squad('paladin', 3, 2.5, 0), squad('cleric', 2, 3, 0, 2), squad('squire', 8, 0.9, 1)],
                [squad('ranger', 8, 0.5, 1), squad('paladin', 4, 2.2, 0, 4), squad('cleric', 2, 3, 1, 6)],
                [squad('paladin', 5, 2, 0), squad('paladin', 5, 2, 1, 3), squad('cleric', 3, 2.5, 0, 6), squad('ranger', 10, 0.5, 1, 10)]
            ]
        };
    }

    cinderReach() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Cinder Reach',
            subtitle: 'The kingdom sends its finest through the burning wastes.',
            mapPosition: { x: 760, y: 250 },
            base: 'ashland',
            zones: [
                { terrain: 'meadow', x: 6, y: 1, w: 6, h: 5 },
                { terrain: 'tundra', x: 14, y: 7, w: 3, h: 5 },
                { terrain: 'tundra', x: 9, y: 16, w: 11, h: 2 },
                { terrain: 'meadow', x: 23, y: 4, w: 5, h: 5 },
                { terrain: 'tundra', x: 6, y: 8, w: 7, h: 5 },
                { terrain: 'meadow', x: 18, y: 4, w: 3, h: 5 }
            ],
            forests: [
                { x: 0, y: 0, w: 4, h: 6 },
                { x: 24, y: 13, w: 6, h: 5 },
                { x: 0, y: 14, w: 6, h: 4 },
                { x: 15, y: 0, w: 5, h: 2 },
                { x: 8, y: 9, w: 2, h: 2 }
            ],
            rocks: [[2, 10], [11, 0], [26, 10], [14, 16], [19, 1]],
            paths: [
                [[5, 0], [5, 6], [13, 6], [13, 12], [20, 12], [20, 15], [8, 15]],
                [[29, 3], [22, 3], [22, 9], [17, 9], [17, 12], [20, 12], [20, 15], [8, 15]]
            ],
            gems: 20,
            startingGold: 280,
            startingMana: 50,
            healthScale: 1.4,
            waves: [
                [squad('peasant', 8, 1.0, 0), squad('ranger', 4, 1.0, 1, 4)],
                [squad('squire', 6, 1.2, 1), squad('peasant', 8, 0.8, 0, 2)],
                [squad('ranger', 10, 0.6, 0), squad('cleric', 1, 1, 0, 5)],
                [squad('paladin', 2, 3, 1), squad('squire', 6, 1, 0, 1)],
                [squad('peasant', 16, 0.45, 0), squad('peasant', 16, 0.45, 1, 2)],
                [squad('cleric', 3, 2, 1), squad('squire', 8, 0.9, 1, 1), squad('ranger', 8, 0.6, 0, 4)],
                [squad('paladin', 5, 2.2, 0), squad('cleric', 2, 3, 0, 3)],
                [squad('ranger', 14, 0.45, 1), squad('ranger', 14, 0.45, 0, 3)],
                [squad('paladin', 4, 2, 1), squad('squire', 10, 0.8, 0, 2), squad('cleric', 3, 2.5, 1, 4)],
                [squad('paladin', 6, 1.8, 0), squad('ranger', 12, 0.5, 1, 5)],
                [squad('squire', 14, 0.6, 0), squad('squire', 14, 0.6, 1, 2), squad('cleric', 4, 2, 0, 6)],
                [squad('paladin', 8, 1.5, 0), squad('paladin', 8, 1.5, 1, 4), squad('cleric', 4, 2.5, 1, 6), squad('ranger', 16, 0.4, 0, 12)]
            ]
        };
    }
}
