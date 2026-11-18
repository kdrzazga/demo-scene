class TextureFactory {
    constructor(scene) {
        this.scene = scene;
        this.tileSize = 32;
        this.variantCount = 4;
        this.towerTierCount = 3;
        this.towerWidth = 40;
        this.towerHeight = 56;
        this.heroWidth = 22;
        this.heroHeight = 30;
        this.gemColors = [0xe040fb, 0x40c4ff, 0x69f0ae, 0xffd740, 0xff5252];
        this.terrainPalettes = {
            meadow: { base: 0x4c8a3a, specks: [0x5d9c47, 0x3e7330, 0x6fae52] },
            tundra: { base: 0xcfe0e8, specks: [0xe9f4f8, 0xb2cddb, 0xbfd8e4] },
            ashland: { base: 0x6e4030, specks: [0x81503b, 0x553023, 0x8d5a40] },
            path: { base: 0xb4966a, specks: [0xa3875c, 0xc6aa7f, 0x927652] }
        };
        this.terrainDetailPainters = {
            meadow: graphics => this.paintGrassBlades(graphics),
            tundra: graphics => this.paintSnowGlints(graphics),
            ashland: graphics => this.paintEmberCracks(graphics),
            path: graphics => this.paintPebbles(graphics)
        };
        this.forestPainters = {
            meadow: graphics => this.paintLeafyTrees(graphics),
            tundra: graphics => this.paintSnowPines(graphics),
            ashland: graphics => this.paintCharredTrees(graphics)
        };
        this.towerPainters = {
            goblin: (graphics, tier) => this.paintGoblinWarren(graphics, tier),
            bone: (graphics, tier) => this.paintBoneSpire(graphics, tier),
            cinder: (graphics, tier) => this.paintCinderShrine(graphics, tier)
        };
        this.heroLooks = {
            peasant: { tunic: 0x8a6a3d, legs: 0x5b4630, headwear: 'straw', item: 'pitchfork' },
            squire: { tunic: 0x3f63a8, legs: 0x8d939c, headwear: 'kettle', item: 'buckler' },
            ranger: { tunic: 0x2f6b3a, legs: 0x4a3a28, headwear: 'hood', item: 'bow' },
            paladin: { tunic: 0xc9ced6, legs: 0x9aa1ab, headwear: 'greathelm', item: 'towerShield' },
            cleric: { tunic: 0xf1ede1, legs: 0xd8d0bd, headwear: 'halo', item: 'staff' }
        };
    }

    createAll() {
        this.createTerrain();
        this.createForests();
        this.createRock();
        this.createGem();
        this.createHoard();
        this.createGate();
        this.createTowers();
        this.createHeroes();
        this.createProjectiles();
    }

    draw(key, width, height, painter) {
        if (this.scene.textures.exists(key)) return;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
        painter(graphics);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    randomCoordinate() {
        return Phaser.Math.Between(1, this.tileSize - 3);
    }

    createTerrain() {
        Object.entries(this.terrainPalettes).forEach(([terrain, palette]) => {
            for (let variant = 0; variant < this.variantCount; variant++) {
                this.draw(`tile-${terrain}-${variant}`, this.tileSize, this.tileSize, graphics => {
                    graphics.fillStyle(palette.base, 1);
                    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
                    for (let speck = 0; speck < 16; speck++) {
                        graphics.fillStyle(Phaser.Utils.Array.GetRandom(palette.specks), 1);
                        graphics.fillRect(this.randomCoordinate(), this.randomCoordinate(), Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 2));
                    }
                    this.terrainDetailPainters[terrain](graphics);
                });
            }
        });
    }

    paintGrassBlades(graphics) {
        graphics.fillStyle(0x7fc25a, 1);
        for (let blade = 0; blade < 6; blade++) {
            const x = this.randomCoordinate();
            const y = this.randomCoordinate();
            graphics.fillRect(x, y, 1, 3);
            graphics.fillRect(x + 2, y + 1, 1, 2);
        }
    }

    paintSnowGlints(graphics) {
        graphics.fillStyle(0xffffff, 1);
        for (let glint = 0; glint < 5; glint++) {
            graphics.fillRect(this.randomCoordinate(), this.randomCoordinate(), 1, 1);
        }
        graphics.fillStyle(0x9dbccc, 1);
        graphics.fillRect(this.randomCoordinate(), this.randomCoordinate(), 4, 1);
    }

    paintEmberCracks(graphics) {
        graphics.fillStyle(0x2f1810, 1);
        const crackX = this.randomCoordinate();
        const crackY = this.randomCoordinate();
        graphics.fillRect(crackX, crackY, 5, 1);
        graphics.fillRect(crackX + 4, crackY + 1, 1, 3);
        if (Phaser.Math.Between(0, 2) === 0) {
            graphics.fillStyle(0xff7a1a, 1);
            graphics.fillRect(crackX + 1, crackY, 2, 1);
        }
    }

    paintPebbles(graphics) {
        graphics.fillStyle(0x8a7454, 1);
        for (let pebble = 0; pebble < 4; pebble++) {
            graphics.fillCircle(this.randomCoordinate(), this.randomCoordinate(), 1.5);
        }
    }

    createForests() {
        Object.entries(this.forestPainters).forEach(([terrain, painter]) => {
            this.draw(`forest-${terrain}`, this.tileSize, this.tileSize, painter);
        });
    }

    paintLeafyTrees(graphics) {
        [[9, 22], [23, 16], [17, 29]].forEach(([x, y]) => {
            graphics.fillStyle(0x000000, 0.25);
            graphics.fillEllipse(x, y + 1, 12, 4);
            graphics.fillStyle(0x5a3b22, 1);
            graphics.fillRect(x - 1, y - 6, 3, 7);
            graphics.fillStyle(0x2c5a22, 1);
            graphics.fillCircle(x, y - 10, 7);
            graphics.fillStyle(0x3f7a2e, 1);
            graphics.fillCircle(x - 2, y - 12, 4);
        });
    }

    paintSnowPines(graphics) {
        [[9, 24], [23, 18], [17, 31]].forEach(([x, y]) => {
            graphics.fillStyle(0x4a3424, 1);
            graphics.fillRect(x - 1, y - 4, 3, 4);
            graphics.fillStyle(0x1f4a44, 1);
            graphics.fillTriangle(x - 7, y - 3, x + 7, y - 3, x, y - 20);
            graphics.fillStyle(0xf4fbff, 1);
            graphics.fillTriangle(x - 3, y - 13, x + 3, y - 13, x, y - 20);
            graphics.fillRect(x - 6, y - 4, 4, 1);
        });
    }

    paintCharredTrees(graphics) {
        [[10, 26], [23, 20]].forEach(([x, y]) => {
            graphics.lineStyle(3, 0x22140f, 1);
            graphics.lineBetween(x, y, x, y - 18);
            graphics.lineStyle(2, 0x22140f, 1);
            graphics.lineBetween(x, y - 10, x - 6, y - 16);
            graphics.lineBetween(x, y - 13, x + 6, y - 20);
            graphics.fillStyle(0xff7a1a, 1);
            graphics.fillRect(x - 6, y - 17, 1, 1);
        });
        graphics.fillStyle(0x3a2018, 1);
        graphics.fillEllipse(16, 29, 10, 3);
    }

    createRock() {
        this.draw('rock', this.tileSize, this.tileSize, graphics => {
            graphics.fillStyle(0x000000, 0.25);
            graphics.fillEllipse(16, 26, 26, 6);
            graphics.fillStyle(0x6d6f78, 1);
            graphics.fillEllipse(13, 19, 20, 16);
            graphics.fillStyle(0x82858f, 1);
            graphics.fillEllipse(21, 22, 14, 10);
            graphics.fillStyle(0xa4a7b0, 1);
            graphics.fillEllipse(11, 15, 7, 4);
        });
    }

    paintDiamond(graphics, x, y, width, height, color) {
        graphics.fillStyle(color, 1);
        graphics.fillPoints([
            { x, y: y - height / 2 },
            { x: x + width / 2, y },
            { x, y: y + height / 2 },
            { x: x - width / 2, y }
        ], true);
    }

    createGem() {
        this.draw('gem', 12, 14, graphics => {
            graphics.fillStyle(0x3a0048, 1);
            graphics.fillPoints([{ x: 6, y: 0 }, { x: 12, y: 7 }, { x: 6, y: 14 }, { x: 0, y: 7 }], true);
            this.paintDiamond(graphics, 6, 7, 9, 11, 0xe040fb);
            graphics.fillStyle(0xf8c4ff, 1);
            graphics.fillTriangle(6, 2, 3, 7, 6, 7);
        });
    }

    createHoard() {
        this.draw('hoard', 56, 46, graphics => {
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillEllipse(28, 40, 54, 10);
            graphics.fillStyle(0x3a3036, 1);
            graphics.fillEllipse(28, 24, 54, 40);
            graphics.fillStyle(0x4a3f46, 1);
            graphics.fillEllipse(23, 18, 36, 20);
            graphics.fillStyle(0x0d080b, 1);
            graphics.fillEllipse(28, 30, 30, 24);
            graphics.fillStyle(0xd4a52a, 1);
            for (let coin = 0; coin < 10; coin++) {
                graphics.fillEllipse(Phaser.Math.Between(16, 40), Phaser.Math.Between(34, 40), 6, 3);
            }
            for (let gem = 0; gem < 12; gem++) {
                this.paintDiamond(graphics, Phaser.Math.Between(17, 39), Phaser.Math.Between(29, 38), 5, 7, Phaser.Utils.Array.GetRandom(this.gemColors));
            }
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(22, 30, 1, 1);
            graphics.fillRect(33, 33, 1, 1);
        });
    }

    createGate() {
        this.draw('gate', this.tileSize, this.tileSize, graphics => {
            graphics.fillStyle(0xfff2b3, 0.45);
            graphics.fillRect(9, 8, 14, 24);
            graphics.fillStyle(0x6e6a64, 1);
            graphics.fillRect(3, 6, 6, 26);
            graphics.fillRect(23, 6, 6, 26);
            graphics.fillRect(1, 2, 30, 6);
            graphics.fillStyle(0x8f8a82, 1);
            graphics.fillRect(1, 2, 30, 2);
            graphics.fillStyle(0x2f5fb3, 1);
            graphics.fillRect(12, 8, 8, 11);
            graphics.fillTriangle(12, 19, 20, 19, 16, 23);
            graphics.fillStyle(0xffd740, 1);
            graphics.fillCircle(16, 13, 2);
        });
    }

    createTowers() {
        Object.entries(this.towerPainters).forEach(([race, painter]) => {
            for (let tier = 0; tier < this.towerTierCount; tier++) {
                this.draw(`tower-${race}-${tier}`, this.towerWidth, this.towerHeight, graphics => painter(graphics, tier));
            }
        });
    }

    paintTowerShadow(graphics, width) {
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(this.towerWidth / 2, this.towerHeight - 3, width, 6);
    }

    paintGoblinWarren(graphics, tier) {
        const centerX = this.towerWidth / 2;
        const ground = this.towerHeight - 2;
        const hutWidth = 22 + tier * 4;
        const hutHeight = 14 + tier * 5;
        const left = centerX - hutWidth / 2;
        const top = ground - hutHeight;
        const roofPeak = top - 12 - tier * 3;
        this.paintTowerShadow(graphics, hutWidth + 8);
        graphics.fillStyle(0x7a5532, 1);
        graphics.fillRect(left, top, hutWidth, hutHeight);
        graphics.fillStyle(0x5e3f24, 1);
        for (let plank = left + 4; plank < left + hutWidth; plank += 5) {
            graphics.fillRect(plank, top, 1, hutHeight);
        }
        graphics.fillStyle(0x24170e, 1);
        graphics.fillRect(centerX - 3, ground - 9, 6, 9);
        graphics.fillStyle(0xffe14d, 1);
        graphics.fillRect(centerX - 2, ground - 7, 1, 1);
        graphics.fillRect(centerX + 1, ground - 7, 1, 1);
        graphics.fillStyle(0x3d6b28, 1);
        graphics.fillTriangle(left - 4, top + 1, left + hutWidth + 4, top + 1, centerX, roofPeak);
        graphics.fillStyle(0x5a8f38, 1);
        graphics.fillTriangle(left, top - 1, centerX, top - 1, centerX, roofPeak + 4);
        if (tier >= 1) {
            graphics.fillStyle(0x4a3220, 1);
            graphics.fillRect(centerX, roofPeak - 10, 2, 11);
            graphics.fillStyle(0xc0392b, 1);
            graphics.fillTriangle(centerX + 2, roofPeak - 10, centerX + 10, roofPeak - 7, centerX + 2, roofPeak - 4);
        }
        if (tier >= 2) {
            [left - 1, left + hutWidth + 1].forEach(skullX => {
                graphics.fillStyle(0xe8e0cc, 1);
                graphics.fillCircle(skullX, top + 4, 3);
                graphics.fillStyle(0x1a1a1a, 1);
                graphics.fillRect(skullX - 2, top + 3, 1, 1);
                graphics.fillRect(skullX + 1, top + 3, 1, 1);
            });
        }
    }

    paintBoneSpire(graphics, tier) {
        const centerX = this.towerWidth / 2;
        const ground = this.towerHeight - 2;
        const height = 30 + tier * 7;
        const halfBase = 9 + tier * 2;
        const baseY = ground - 2;
        const skullY = ground - height + 2;
        this.paintTowerShadow(graphics, halfBase * 2 + 10);
        graphics.fillStyle(0x6d7178, 1);
        graphics.fillEllipse(centerX, baseY, halfBase * 2 + 8, 8);
        graphics.fillStyle(0xd9d2c0, 1);
        graphics.fillTriangle(centerX - halfBase, baseY, centerX + halfBase, baseY, centerX, ground - height);
        graphics.fillStyle(0xb3ab98, 1);
        graphics.fillTriangle(centerX, baseY, centerX + halfBase, baseY, centerX, ground - height);
        graphics.lineStyle(1, 0x8c8473, 1);
        const ribCount = 3 + tier;
        for (let rib = 1; rib <= ribCount; rib++) {
            const ribY = baseY - rib * ((height - 6) / (ribCount + 1));
            const halfWidth = halfBase * (1 - (baseY - ribY) / height);
            graphics.lineBetween(centerX - halfWidth, ribY, centerX + halfWidth, ribY);
        }
        if (tier >= 1) {
            graphics.fillStyle(0xe8e2d2, 1);
            graphics.fillTriangle(centerX - halfBase - 5, baseY - 12, centerX - halfBase + 4, baseY - 8, centerX - halfBase + 3, baseY - 4);
            graphics.fillTriangle(centerX + halfBase + 5, baseY - 12, centerX + halfBase - 4, baseY - 8, centerX + halfBase - 3, baseY - 4);
        }
        graphics.fillStyle(0xf2ecdc, 1);
        graphics.fillCircle(centerX, skullY, 5);
        graphics.fillRect(centerX - 3, skullY + 2, 6, 4);
        graphics.fillStyle(0x5fe3ff, 1);
        graphics.fillRect(centerX - 3, skullY - 1, 2, 2);
        graphics.fillRect(centerX + 1, skullY - 1, 2, 2);
        if (tier >= 2) {
            graphics.fillStyle(0xd9d2c0, 1);
            graphics.fillTriangle(centerX - 5, skullY - 3, centerX - 7, skullY - 12, centerX - 2, skullY - 4);
            graphics.fillTriangle(centerX + 5, skullY - 3, centerX + 7, skullY - 12, centerX + 2, skullY - 4);
        }
    }

    paintCinderShrine(graphics, tier) {
        const centerX = this.towerWidth / 2;
        const ground = this.towerHeight - 2;
        const stepCount = 2 + tier;
        const stepHeight = 7;
        this.paintTowerShadow(graphics, 36);
        if (tier >= 1) {
            [centerX - 17, centerX + 13].forEach(brazierX => {
                graphics.fillStyle(0x2e1b20, 1);
                graphics.fillRect(brazierX, ground - 12, 4, 12);
                graphics.fillStyle(0xffa63d, 1);
                graphics.fillTriangle(brazierX - 1, ground - 12, brazierX + 5, ground - 12, brazierX + 2, ground - 19);
            });
        }
        let top = ground;
        for (let step = 0; step < stepCount; step++) {
            const width = 30 - step * 6;
            top -= stepHeight;
            graphics.fillStyle(step % 2 === 0 ? 0x3a2329 : 0x2e1b20, 1);
            graphics.fillRect(centerX - width / 2, top, width, stepHeight);
            graphics.fillStyle(0xff7a1a, 0.9);
            graphics.fillRect(centerX - width / 2 + 2, top + stepHeight - 2, width - 4, 1);
        }
        if (tier >= 2) {
            graphics.fillStyle(0x1e1215, 1);
            graphics.fillTriangle(centerX - 6, top, centerX - 12, top - 12, centerX - 3, top);
            graphics.fillTriangle(centerX + 6, top, centerX + 12, top - 12, centerX + 3, top);
        }
        const orbY = top - 7;
        graphics.fillStyle(0xff7a1a, 0.35);
        graphics.fillCircle(centerX, orbY, 9);
        graphics.fillStyle(0xff6a00, 1);
        graphics.fillCircle(centerX, orbY, 6);
        graphics.fillStyle(0xffd75e, 1);
        graphics.fillCircle(centerX - 1, orbY - 1, 3);
    }

    createHeroes() {
        Object.entries(this.heroLooks).forEach(([kind, look]) => {
            this.draw(`hero-${kind}`, this.heroWidth, this.heroHeight, graphics => this.paintHero(graphics, look));
        });
    }

    paintHero(graphics, look) {
        const centerX = 11;
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(centerX, 28, 14, 4);
        graphics.fillStyle(look.legs, 1);
        graphics.fillRect(centerX - 4, 20, 3, 8);
        graphics.fillRect(centerX + 1, 20, 3, 8);
        graphics.fillStyle(look.tunic, 1);
        graphics.fillRect(centerX - 5, 11, 10, 10);
        graphics.fillStyle(0x3a2a1a, 1);
        graphics.fillRect(centerX - 5, 18, 10, 2);
        graphics.fillStyle(0xf0c9a0, 1);
        graphics.fillCircle(centerX, 7, 4);
        this.paintHeadwear(graphics, look.headwear, centerX);
        this.paintHeroItem(graphics, look.item);
    }

    paintHeadwear(graphics, headwear, centerX) {
        if (headwear === 'straw') {
            graphics.fillStyle(0xe8c45a, 1);
            graphics.fillEllipse(centerX, 4, 14, 4);
            graphics.fillRect(centerX - 3, 1, 6, 3);
        } else if (headwear === 'kettle') {
            graphics.fillStyle(0x8d939c, 1);
            graphics.fillEllipse(centerX, 4, 13, 5);
            graphics.fillRect(centerX - 4, 1, 8, 3);
        } else if (headwear === 'hood') {
            graphics.fillStyle(0x24552e, 1);
            graphics.fillCircle(centerX, 6, 5);
            graphics.fillTriangle(centerX - 2, 2, centerX + 2, 2, centerX + 5, -1);
            graphics.fillStyle(0xf0c9a0, 1);
            graphics.fillCircle(centerX + 1, 8, 2.5);
        } else if (headwear === 'greathelm') {
            graphics.fillStyle(0xd4af37, 1);
            graphics.fillRect(centerX - 4, 2, 8, 9);
            graphics.fillStyle(0x222222, 1);
            graphics.fillRect(centerX - 3, 5, 6, 1);
            graphics.fillStyle(0xc0392b, 1);
            graphics.fillRect(centerX - 1, 0, 2, 3);
        } else if (headwear === 'halo') {
            graphics.lineStyle(1.5, 0xffe680, 1);
            graphics.strokeEllipse(centerX, 2, 10, 3);
        }
    }

    paintHeroItem(graphics, item) {
        if (item === 'pitchfork') {
            graphics.lineStyle(1, 0x7a5a33, 1);
            graphics.lineBetween(17, 4, 17, 26);
            graphics.fillStyle(0x9aa1ab, 1);
            graphics.fillRect(15, 2, 1, 4);
            graphics.fillRect(17, 2, 1, 4);
            graphics.fillRect(19, 2, 1, 4);
            graphics.fillRect(15, 5, 5, 1);
        } else if (item === 'buckler') {
            graphics.fillStyle(0xa0a8b2, 1);
            graphics.fillCircle(5, 16, 4);
            graphics.fillStyle(0x3f63a8, 1);
            graphics.fillCircle(5, 16, 2);
        } else if (item === 'bow') {
            graphics.lineStyle(1.5, 0x6b4a2b, 1);
            graphics.beginPath();
            graphics.arc(13, 15, 8, -1.2, 1.2);
            graphics.strokePath();
            graphics.lineStyle(1, 0xdddddd, 1);
            graphics.lineBetween(15.9, 7.5, 15.9, 22.5);
        } else if (item === 'towerShield') {
            graphics.fillStyle(0xd4af37, 1);
            graphics.fillRect(1, 11, 7, 12);
            graphics.fillStyle(0xf5f5f5, 1);
            graphics.fillRect(2, 12, 5, 10);
            graphics.fillStyle(0xffc940, 1);
            graphics.fillCircle(4.5, 17, 2);
        } else if (item === 'staff') {
            graphics.lineStyle(1.5, 0x8b6b3e, 1);
            graphics.lineBetween(18, 4, 18, 27);
            graphics.fillStyle(0xffe680, 1);
            graphics.fillCircle(18, 3, 2.5);
        }
    }

    createProjectiles() {
        this.draw('arrow', 14, 4, graphics => {
            graphics.fillStyle(0x7a5a33, 1);
            graphics.fillRect(1, 1, 10, 2);
            graphics.fillStyle(0xd0d4da, 1);
            graphics.fillTriangle(10, 0, 14, 2, 10, 4);
            graphics.fillStyle(0xc0392b, 1);
            graphics.fillRect(0, 0, 3, 1);
            graphics.fillRect(0, 3, 3, 1);
        });
        this.draw('frostbolt', 12, 12, graphics => {
            graphics.fillStyle(0x8be9ff, 0.5);
            graphics.fillCircle(6, 6, 6);
            graphics.fillStyle(0x8be9ff, 1);
            graphics.fillCircle(6, 6, 4);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(6, 6, 2);
        });
        this.draw('fireball', 14, 14, graphics => {
            graphics.fillStyle(0xff3d00, 0.5);
            graphics.fillCircle(7, 7, 7);
            graphics.fillStyle(0xff6a00, 1);
            graphics.fillCircle(7, 7, 5);
            graphics.fillStyle(0xffd34d, 1);
            graphics.fillCircle(7, 7, 2.5);
        });
        this.draw('meteor', 26, 26, graphics => {
            graphics.fillStyle(0xff7a1a, 0.4);
            graphics.fillCircle(13, 13, 13);
            graphics.fillStyle(0x5a2a1a, 1);
            graphics.fillCircle(13, 13, 9);
            graphics.fillStyle(0xff7a1a, 1);
            graphics.fillCircle(11, 11, 5);
            graphics.fillStyle(0xffe08a, 1);
            graphics.fillCircle(10, 10, 2);
        });
    }
}
