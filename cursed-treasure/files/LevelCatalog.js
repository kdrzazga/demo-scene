class LevelCatalog {
    constructor() {
        this.packs = [
            { title: 'The Borderlands', levels: [this.mossyHollow(), this.frostfangPass(), this.cinderReach()] },
            { title: 'The Sunken Marches', levels: [this.bogwaterCrossing(), this.gallowsRidge(), this.emberAbbey()] },
            { title: "The King's Road", levels: [this.thornwallBastion(), this.glacierThrone(), this.theLastHoard()] }
        ];
        this.levels = this.packs.flatMap(pack => pack.levels);
    }

    packIndexOf(levelIndex) {
        let packEnd = 0;
        for (let packIndex = 0; packIndex < this.packs.length; packIndex++) {
            packEnd += this.packs[packIndex].levels.length;
            if (levelIndex < packEnd) return packIndex;
        }
        return this.packs.length - 1;
    }

    firstLevelIndexOf(packIndex) {
        return this.packs.slice(0, packIndex).reduce((sum, pack) => sum + pack.levels.length, 0);
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
            mines: [[3, 6]],
            wideSegments: [],
            springs: [[18, 3]],
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
                [squad('squire', 6, 1.0), squad('cleric', 2, 3, 0, 3), squad('paladin', 3, 2.5, 0, 9)],
                [squad('ranger', 10, 0.6), squad('peasant', 12, 0.5, 0, 4)],
                [squad('squire', 10, 0.9), squad('cleric', 2, 3, 0, 4), squad('ranger', 6, 0.7, 0, 9)],
                [squad('paladin', 4, 2.5), squad('cleric', 2, 3, 0, 3), squad('peasant', 14, 0.45, 0, 6)],
                [squad('ranger', 14, 0.45), squad('squire', 8, 0.9, 0, 5), squad('paladin', 3, 2.5, 0, 10)],
                [squad('paladin', 6, 2.0), squad('cleric', 3, 2.5, 0, 4), squad('squire', 10, 0.8, 0, 8), squad('ranger', 10, 0.5, 0, 14)]
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
            mines: [[6, 0]],
            wideSegments: [
                { from: [0, 2], to: [10, 2], lane: [0, 1] },
                { from: [10, 2], to: [10, 8], lane: [-1, 0] },
                { from: [10, 8], to: [20, 8], lane: [0, -1] }
            ],
            springs: [[25, 11]],
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
                [squad('paladin', 5, 2, 0), squad('paladin', 5, 2, 1, 3), squad('cleric', 3, 2.5, 0, 6), squad('ranger', 10, 0.5, 1, 10)],
                [squad('ranger', 12, 0.5, 0), squad('ranger', 12, 0.5, 1, 2), squad('cleric', 2, 3, 0, 6)],
                [squad('squire', 12, 0.8, 1), squad('paladin', 4, 2.2, 0, 3), squad('cleric', 3, 2.5, 1, 6)],
                [squad('peasant', 20, 0.4, 0), squad('peasant', 20, 0.4, 1, 1), squad('paladin', 4, 2, 0, 8)],
                [squad('paladin', 6, 1.8, 1), squad('squire', 12, 0.7, 0, 2), squad('cleric', 4, 2, 1, 5), squad('ranger', 10, 0.5, 0, 10)],
                [squad('paladin', 8, 1.6, 0), squad('paladin', 8, 1.6, 1, 3), squad('cleric', 4, 2.2, 0, 6), squad('squire', 14, 0.6, 1, 8), squad('ranger', 14, 0.45, 0, 14)]
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
            mines: [[26, 11]],
            wideSegments: [
                { from: [20, 12], to: [20, 15], lane: [1, 0] },
                { from: [13, 6], to: [13, 12], lane: [-1, 0] }
            ],
            springs: [[2, 8]],
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
                [squad('paladin', 8, 1.5, 0), squad('paladin', 8, 1.5, 1, 4), squad('cleric', 4, 2.5, 1, 6), squad('ranger', 16, 0.4, 0, 12), squad('blackKnight', 1, 1, 0, 20), squad('blackKnight', 1, 1, 1, 30)]
            ]
        };
    }

    bogwaterCrossing() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Bogwater Crossing',
            subtitle: 'Two causeways cross the marsh and meet at a single ford.',
            mapPosition: { x: 200, y: 250 },
            base: 'meadow',
            zones: [
                { terrain: 'tundra', x: 12, y: 10, w: 3, h: 4 },
                { terrain: 'ashland', x: 17, y: 10, w: 6, h: 3 },
                { terrain: 'tundra', x: 2, y: 5, w: 5, h: 3 },
                { terrain: 'ashland', x: 25, y: 10, w: 4, h: 4 },
                { terrain: 'ashland', x: 9, y: 0, w: 5, h: 2 },
                { terrain: 'tundra', x: 9, y: 10, w: 2, h: 4 }
            ],
            forests: [
                { x: 0, y: 0, w: 5, h: 2 },
                { x: 16, y: 16, w: 6, h: 2 },
                { x: 25, y: 15, w: 5, h: 3 },
                { x: 2, y: 12, w: 3, h: 2 },
                { x: 9, y: 5, w: 3, h: 3 }
            ],
            rocks: [[12, 2], [20, 16], [5, 13], [28, 2], [17, 6]],
            mines: [[3, 10]],
            springs: [[19, 5]],
            wideSegments: [
                { from: [8, 9], to: [15, 9], lane: [0, -1] }
            ],
            paths: [
                [[0, 3], [8, 3], [8, 9], [15, 9], [15, 14], [24, 14], [24, 8], [27, 8]],
                [[0, 15], [11, 15], [11, 9], [15, 9], [15, 14], [24, 14], [24, 8], [27, 8]]
            ],
            gems: 20,
            startingGold: 300,
            startingMana: 50,
            healthScale: 1.5,
            waves: [
                [squad('peasant', 8, 1.0, 0), squad('peasant', 8, 1.0, 1, 3)],
                [squad('squire', 5, 1.3, 0), squad('ranger', 5, 1.0, 1, 2)],
                [squad('ranger', 10, 0.6, 1), squad('cleric', 1, 1, 1, 5)],
                [squad('squire', 8, 1.0, 0), squad('paladin', 2, 3, 1, 3)],
                [squad('peasant', 18, 0.4, 0), squad('peasant', 18, 0.4, 1, 1)],
                [squad('paladin', 3, 2.5, 0), squad('cleric', 2, 2.5, 0, 2), squad('ranger', 10, 0.5, 1, 4)],
                [squad('squire', 12, 0.7, 1), squad('cleric', 2, 3, 1, 3), squad('ranger', 8, 0.5, 0, 6)],
                [squad('paladin', 5, 2, 0), squad('paladin', 4, 2, 1, 4)],
                [squad('ranger', 16, 0.4, 0), squad('ranger', 16, 0.4, 1, 2), squad('cleric', 2, 3, 0, 5)],
                [squad('squire', 14, 0.6, 0), squad('paladin', 4, 2, 1, 2), squad('cleric', 3, 2.5, 1, 5)],
                [squad('paladin', 6, 1.8, 1), squad('peasant', 24, 0.35, 0, 1), squad('cleric', 3, 2.5, 0, 6)],
                [squad('paladin', 7, 1.6, 0), squad('paladin', 7, 1.6, 1, 3), squad('cleric', 4, 2.2, 0, 6), squad('ranger', 14, 0.45, 1, 10)]
            ]
        };
    }

    gallowsRidge() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Gallows Ridge',
            subtitle: 'Three gibbet roads climb to the hoard on the frozen crest.',
            mapPosition: { x: 480, y: 190 },
            base: 'tundra',
            zones: [
                { terrain: 'meadow', x: 1, y: 3, w: 4, h: 5 },
                { terrain: 'ashland', x: 7, y: 8, w: 4, h: 4 },
                { terrain: 'meadow', x: 19, y: 11, w: 4, h: 2 },
                { terrain: 'ashland', x: 14, y: 12, w: 3, h: 4 },
                { terrain: 'ashland', x: 25, y: 15, w: 4, h: 3 },
                { terrain: 'meadow', x: 8, y: 0, w: 6, h: 4 }
            ],
            forests: [
                { x: 0, y: 12, w: 3, h: 6 },
                { x: 14, y: 0, w: 6, h: 3 },
                { x: 26, y: 0, w: 4, h: 6 },
                { x: 4, y: 15, w: 4, h: 3 },
                { x: 20, y: 4, w: 3, h: 2 }
            ],
            rocks: [[16, 3], [27, 8], [2, 10], [20, 16], [8, 14]],
            mines: [[3, 14], [9, 4, 2], [23, 8, 1], [8, 16, 0]],
            springs: [[21, 7]],
            wideSegments: [
                { from: [6, 2], to: [6, 7], lane: [-1, 0] },
                { from: [24, 14], to: [18, 14], lane: [0, 1] }
            ],
            paths: [
                [[0, 2], [6, 2], [6, 7], [12, 7], [12, 10], [15, 10]],
                [[29, 10], [24, 10], [24, 14], [18, 14], [18, 10], [15, 10]],
                [[17, 17], [17, 16], [10, 16], [10, 13], [13, 13], [13, 10], [15, 10]]
            ],
            gems: 20,
            startingGold: 320,
            startingMana: 50,
            healthScale: 1.6,
            waves: [
                [squad('peasant', 2, 1.0, 0), squad('peasant', 2, 1.0, 1, 2), squad('peasant', 2, 1.0, 2, 4)],
                [squad('ranger', 2, 0.8, 2), squad('squire', 2, 1.2, 0, 2)],
                [squad('squire', 2, 1.0, 1), squad('cleric', 1, 1, 1, 4), squad('ranger', 2, 0.7, 0, 5)],
                [squad('paladin', 1, 3, 0), squad('paladin', 1, 3, 1, 2), squad('peasant', 4, 0.5, 2, 3)],
                [squad('paladin', 2, 3, 0), squad('paladin', 2, 3, 2, 2)],
                [squad('squire', 6, 0.8, 1), squad('cleric', 1, 3, 1, 3), squad('paladin', 2, 2.5, 2, 5)],
                [squad('peasant', 10, 0.35, 0), squad('peasant', 10, 0.35, 1, 1), squad('peasant', 10, 0.35, 2, 2)],
                [squad('paladin', 2, 2.2, 1), squad('cleric', 1, 3, 1, 2), squad('ranger', 8, 0.5, 2, 4)],
                [squad('squire', 6, 0.7, 0), squad('squire', 6, 0.7, 2, 3), squad('cleric', 2, 2.5, 0, 5)],
                [squad('paladin', 3, 2, 0), squad('paladin', 3, 2, 2, 3), squad('ranger', 9, 0.45, 1, 6)],
                [squad('cleric', 2, 2, 1), squad('squire', 9, 0.6, 1, 1), squad('ranger', 9, 0.45, 0, 4), squad('paladin', 2, 2, 2, 8)],
                [squad('paladin', 4, 1.7, 0), squad('paladin', 4, 1.7, 1, 2), squad('paladin', 4, 1.7, 2, 4), squad('cleric', 2, 2.2, 1, 6)],
                [squad('ranger', 12, 0.4, 0), squad('squire', 10, 0.55, 2, 2), squad('cleric', 2, 2, 1, 5), squad('paladin', 5, 1.5, 1, 10), squad('mage', 1, 1, 1, 14)]
            ]
        };
    }

    emberAbbey() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Ember Abbey',
            subtitle: 'The burned abbey hides your hoard. Zawisza Czarny and Mage Merlin come for it.',
            mapPosition: { x: 760, y: 250 },
            base: 'ashland',
            zones: [
                { terrain: 'tundra', x: 13, y: 12, w: 6, h: 3 },
                { terrain: 'meadow', x: 10, y: 1, w: 5, h: 4 },
                { terrain: 'tundra', x: 6, y: 10, w: 5, h: 4 },
                { terrain: 'meadow', x: 22, y: 8, w: 5, h: 5 },
                { terrain: 'meadow', x: 17, y: 1, w: 4, h: 4 },
                { terrain: 'tundra', x: 1, y: 1, w: 4, h: 3 }
            ],
            forests: [
                { x: 0, y: 14, w: 4, h: 4 },
                { x: 22, y: 0, w: 4, h: 3 },
                { x: 13, y: 16, w: 6, h: 2 },
                { x: 5, y: 0, w: 3, h: 2 },
                { x: 27, y: 9, w: 3, h: 4 }
            ],
            rocks: [[3, 5], [14, 8], [27, 3], [24, 6], [10, 16]],
            mines: [[8, 3]],
            springs: [[1, 12]],
            wideSegments: [
                { from: [16, 6], to: [9, 6], lane: [0, 1] },
                { from: [20, 11], to: [12, 11], lane: [0, -1] }
            ],
            paths: [
                [[29, 15], [20, 15], [20, 11], [12, 11], [12, 15], [5, 15], [5, 9], [2, 9]],
                [[16, 0], [16, 6], [9, 6], [9, 9], [2, 9]]
            ],
            gems: 20,
            startingGold: 340,
            startingMana: 60,
            healthScale: 1.75,
            waves: [
                [squad('peasant', 10, 0.8, 0), squad('ranger', 5, 1.0, 1, 3)],
                [squad('squire', 6, 1.1, 1), squad('peasant', 10, 0.7, 0, 2)],
                [squad('ranger', 12, 0.5, 0), squad('cleric', 1, 1, 0, 5)],
                [squad('paladin', 3, 2.5, 1), squad('squire', 7, 1, 0, 1)],
                [squad('peasant', 18, 0.4, 0), squad('peasant', 18, 0.4, 1, 2)],
                [squad('cleric', 3, 2, 1), squad('squire', 10, 0.8, 1, 1), squad('ranger', 10, 0.5, 0, 4)],
                [squad('paladin', 6, 2, 0), squad('cleric', 2, 3, 0, 3)],
                [squad('ranger', 16, 0.4, 1), squad('ranger', 16, 0.4, 0, 3)],
                [squad('paladin', 5, 1.8, 1), squad('squire', 12, 0.7, 0, 2), squad('cleric', 3, 2.5, 1, 4)],
                [squad('paladin', 7, 1.6, 0), squad('ranger', 14, 0.45, 1, 5), squad('cleric', 3, 2.5, 0, 7)],
                [squad('squire', 16, 0.55, 0), squad('squire', 16, 0.55, 1, 2), squad('cleric', 4, 2, 0, 6)],
                [squad('paladin', 8, 1.5, 0), squad('paladin', 8, 1.5, 1, 4), squad('cleric', 4, 2.5, 1, 6), squad('ranger', 16, 0.4, 0, 12), squad('blackKnight', 1, 1, 0, 22), squad('mage', 1, 1, 1, 30)]
            ]
        };
    }

    thornwallBastion() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Thornwall Bastion',
            subtitle: "The king's host marches from west, north and east at once.",
            mapPosition: { x: 200, y: 250 },
            base: 'meadow',
            zones: [
                { terrain: 'tundra', x: 8, y: 5, w: 5, h: 6 },
                { terrain: 'ashland', x: 18, y: 10, w: 5, h: 3 },
                { terrain: 'ashland', x: 1, y: 13, w: 5, h: 4 },
                { terrain: 'tundra', x: 24, y: 10, w: 5, h: 5 },
                { terrain: 'tundra', x: 8, y: 13, w: 3, h: 4 },
                { terrain: 'ashland', x: 15, y: 2, w: 5, h: 5 }
            ],
            forests: [
                { x: 0, y: 0, w: 5, h: 3 },
                { x: 22, y: 15, w: 3, h: 3 },
                { x: 18, y: 14, w: 2, h: 2 },
                { x: 25, y: 2, w: 4, h: 4 },
                { x: 1, y: 9, w: 3, h: 3 }
            ],
            rocks: [[10, 2], [21, 3], [5, 17], [27, 1], [13, 14]],
            mines: [[3, 7]],
            springs: [[26, 16]],
            wideSegments: [
                { from: [14, 0], to: [14, 9], lane: [-1, 0] },
                { from: [29, 8], to: [23, 8], lane: [0, 1] }
            ],
            paths: [
                [[0, 4], [7, 4], [7, 12], [12, 12], [12, 16], [15, 16]],
                [[14, 0], [14, 9], [17, 9], [17, 16], [15, 16]],
                [[29, 8], [23, 8], [23, 13], [20, 13], [20, 16], [15, 16]]
            ],
            gems: 20,
            startingGold: 360,
            startingMana: 60,
            healthScale: 1.9,
            waves: [
                [squad('peasant', 8, 0.8, 0), squad('peasant', 8, 0.8, 1, 2), squad('peasant', 8, 0.8, 2, 4)],
                [squad('squire', 6, 1.0, 1), squad('ranger', 8, 0.7, 2, 2)],
                [squad('ranger', 10, 0.5, 0), squad('cleric', 2, 2.5, 1, 3), squad('squire', 6, 1, 1, 4)],
                [squad('paladin', 3, 2.5, 2), squad('paladin', 3, 2.5, 0, 3)],
                [squad('peasant', 16, 0.35, 0), squad('peasant', 16, 0.35, 1, 1), squad('peasant', 16, 0.35, 2, 2)],
                [squad('squire', 12, 0.7, 2), squad('cleric', 3, 2.5, 2, 2), squad('ranger', 12, 0.45, 0, 4)],
                [squad('paladin', 5, 2, 1), squad('cleric', 2, 3, 1, 2), squad('squire', 10, 0.7, 0, 5)],
                [squad('ranger', 14, 0.4, 0), squad('ranger', 14, 0.4, 1, 2), squad('ranger', 14, 0.4, 2, 4)],
                [squad('paladin', 6, 1.8, 2), squad('squire', 14, 0.6, 1, 2), squad('cleric', 4, 2.2, 0, 4)],
                [squad('paladin', 6, 1.7, 0), squad('paladin', 6, 1.7, 1, 2), squad('cleric', 4, 2, 2, 5), squad('ranger', 14, 0.45, 2, 8)],
                [squad('squire', 18, 0.5, 0), squad('squire', 18, 0.5, 2, 2), squad('cleric', 5, 2, 1, 4), squad('paladin', 5, 1.8, 1, 9)],
                [squad('paladin', 8, 1.5, 0), squad('paladin', 8, 1.5, 1, 3), squad('paladin', 8, 1.5, 2, 6), squad('cleric', 5, 2, 1, 8)],
                [squad('ranger', 20, 0.35, 0), squad('ranger', 20, 0.35, 2, 2), squad('cleric', 5, 2, 1, 4), squad('paladin', 10, 1.4, 1, 10), squad('squire', 16, 0.5, 0, 14), squad('mage', 1, 1, 2, 16)]
            ]
        };
    }

    glacierThrone() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'Glacier Throne',
            subtitle: 'A long switchback over the ice. Every bend is a killing ground.',
            mapPosition: { x: 480, y: 190 },
            base: 'tundra',
            zones: [
                { terrain: 'meadow', x: 5, y: 2, w: 8, h: 2 },
                { terrain: 'ashland', x: 4, y: 7, w: 8, h: 2 },
                { terrain: 'meadow', x: 14, y: 11, w: 3, h: 3 },
                { terrain: 'ashland', x: 18, y: 10, w: 5, h: 2 },
                { terrain: 'meadow', x: 24, y: 10, w: 5, h: 4 },
                { terrain: 'ashland', x: 0, y: 12, w: 4, h: 5 }
            ],
            forests: [
                { x: 0, y: 13, w: 3, h: 5 },
                { x: 22, y: 3, w: 4, h: 3 },
                { x: 5, y: 14, w: 6, h: 4 },
                { x: 25, y: 6, w: 4, h: 2 },
                { x: 8, y: 11, w: 4, h: 2 }
            ],
            rocks: [[1, 7], [15, 7], [26, 4], [10, 16], [21, 17]],
            mines: [[8, 13]],
            springs: [[20, 3]],
            wideSegments: [
                { from: [18, 5], to: [3, 5], lane: [0, 1] },
                { from: [13, 15], to: [28, 15], lane: [0, 1] }
            ],
            paths: [
                [[0, 1], [18, 1], [18, 5], [3, 5], [3, 10], [13, 10], [13, 15], [28, 15]],
                [[29, 9], [17, 9], [17, 13], [23, 13], [23, 15], [28, 15]]
            ],
            gems: 20,
            startingGold: 380,
            startingMana: 60,
            healthScale: 2.05,
            waves: [
                [squad('peasant', 10, 0.8, 0), squad('ranger', 6, 0.9, 1, 3)],
                [squad('squire', 8, 1.0, 0), squad('peasant', 10, 0.6, 1, 2)],
                [squad('ranger', 12, 0.5, 1), squad('cleric', 2, 2.5, 0, 3)],
                [squad('paladin', 4, 2.4, 0), squad('squire', 8, 0.9, 1, 2)],
                [squad('peasant', 22, 0.35, 0), squad('ranger', 12, 0.45, 1, 3)],
                [squad('cleric', 3, 2, 0), squad('paladin', 4, 2.2, 0, 1), squad('ranger', 12, 0.45, 1, 4)],
                [squad('squire', 14, 0.6, 1), squad('squire', 14, 0.6, 0, 2), squad('cleric', 3, 2.5, 1, 4)],
                [squad('paladin', 6, 1.8, 0), squad('paladin', 6, 1.8, 1, 3)],
                [squad('ranger', 20, 0.35, 0), squad('ranger', 16, 0.4, 1, 2), squad('cleric', 3, 2.5, 0, 5), squad('mage', 1, 1, 1, 6)],
                [squad('paladin', 7, 1.6, 1), squad('squire', 16, 0.55, 0, 2), squad('cleric', 4, 2.2, 1, 5)],
                [squad('paladin', 8, 1.5, 0), squad('cleric', 4, 2, 0, 3), squad('ranger', 18, 0.4, 1, 6)],
                [squad('squire', 20, 0.45, 0), squad('squire', 20, 0.45, 1, 2), squad('cleric', 5, 2, 0, 5), squad('paladin', 6, 1.6, 1, 9)],
                [squad('paladin', 10, 1.3, 0), squad('paladin', 10, 1.3, 1, 3), squad('cleric', 5, 2, 0, 6), squad('ranger', 18, 0.4, 1, 12), squad('blackKnight', 1, 1, 0, 24)]
            ]
        };
    }

    theLastHoard() {
        const squad = (...args) => this.group(...args);
        return {
            name: 'The Last Hoard',
            subtitle: 'The whole kingdom marches on your final cave. Zawisza and Merlin lead it.',
            mapPosition: { x: 760, y: 250 },
            base: 'ashland',
            zones: [
                { terrain: 'meadow', x: 6, y: 4, w: 3, h: 4 },
                { terrain: 'tundra', x: 0, y: 10, w: 6, h: 4 },
                { terrain: 'meadow', x: 16, y: 0, w: 3, h: 3 },
                { terrain: 'tundra', x: 11, y: 9, w: 3, h: 5 },
                { terrain: 'tundra', x: 17, y: 9, w: 5, h: 3 },
                { terrain: 'meadow', x: 24, y: 14, w: 4, h: 3 },
                { terrain: 'meadow', x: 17, y: 13, w: 5, h: 2 }
            ],
            forests: [
                { x: 0, y: 14, w: 2, h: 4 },
                { x: 6, y: 13, w: 5, h: 5 },
                { x: 24, y: 0, w: 6, h: 5 },
                { x: 12, y: 5, w: 2, h: 2 },
                { x: 0, y: 0, w: 3, h: 3 }
            ],
            rocks: [[12, 1], [7, 11], [27, 8], [4, 1], [21, 7]],
            mines: [[3, 15]],
            springs: [[26, 10]],
            wideSegments: [
                { from: [10, 3], to: [10, 8], lane: [-1, 0] },
                { from: [15, 16], to: [15, 8], lane: [1, 0] }
            ],
            paths: [
                [[0, 8], [5, 8], [5, 3], [10, 3], [10, 8], [15, 8]],
                [[20, 0], [20, 4], [15, 4], [15, 8]],
                [[29, 13], [23, 13], [23, 16], [15, 16], [15, 8]]
            ],
            gems: 20,
            startingGold: 400,
            startingMana: 70,
            healthScale: 2.2,
            waves: [
                [squad('peasant', 8, 0.8, 0), squad('peasant', 8, 0.8, 1, 2), squad('peasant', 8, 0.8, 2, 4)],
                [squad('squire', 6, 1.0, 2), squad('ranger', 8, 0.6, 0, 2), squad('ranger', 6, 0.6, 1, 4)],
                [squad('paladin', 2, 3, 1), squad('cleric', 2, 2.5, 2, 2), squad('squire', 8, 0.9, 0, 3)],
                [squad('ranger', 14, 0.4, 0), squad('ranger', 14, 0.4, 2, 3)],
                [squad('paladin', 4, 2.2, 2), squad('paladin', 3, 2.2, 1, 2), squad('cleric', 2, 3, 2, 4)],
                [squad('peasant', 20, 0.3, 0), squad('peasant', 20, 0.3, 1, 1), squad('peasant', 20, 0.3, 2, 2)],
                [squad('squire', 14, 0.55, 0), squad('cleric', 3, 2.5, 0, 2), squad('ranger', 14, 0.4, 1, 5), squad('mage', 1, 1, 2, 6)],
                [squad('paladin', 6, 1.7, 2), squad('paladin', 6, 1.7, 0, 3), squad('cleric', 4, 2.2, 2, 5)],
                [squad('ranger', 18, 0.35, 0), squad('ranger', 18, 0.35, 1, 2), squad('ranger', 18, 0.35, 2, 4)],
                [squad('squire', 18, 0.5, 1), squad('paladin', 6, 1.6, 2, 2), squad('cleric', 5, 2, 0, 4), squad('blackKnight', 1, 1, 0, 12)],
                [squad('paladin', 8, 1.4, 0), squad('paladin', 8, 1.4, 2, 3), squad('cleric', 5, 2, 1, 5), squad('ranger', 18, 0.4, 1, 8)],
                [squad('squire', 20, 0.45, 0), squad('squire', 20, 0.45, 1, 2), squad('squire', 20, 0.45, 2, 4), squad('cleric', 6, 1.8, 2, 6)],
                [squad('paladin', 10, 1.3, 0), squad('paladin', 10, 1.3, 1, 2), squad('paladin', 10, 1.3, 2, 4), squad('cleric', 6, 2, 0, 6), squad('ranger', 20, 0.35, 2, 10)],
                [squad('paladin', 12, 1.2, 0), squad('paladin', 12, 1.2, 2, 3), squad('cleric', 6, 2, 1, 5), squad('squire', 20, 0.45, 1, 9), squad('blackKnight', 1, 1, 0, 20), squad('mage', 1, 1, 2, 30)]
            ]
        };
    }
}
