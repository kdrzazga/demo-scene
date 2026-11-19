class Battle {
    constructor(scene, level, levelIndex, progress) {
        this.scene = scene;
        this.level = level;
        this.levelIndex = levelIndex;
        this.progress = progress;
        this.healthGrowthPerWave = 0.07;
        this.gemDropSpacing = 8;
        this.battlefield = new Battlefield(scene, level);
        this.hoard = new Hoard(scene, this.battlefield.hoardPosition, level.gems);
        this.treasury = new Treasury(level.startingGold, level.startingMana);
        this.waveDirector = new WaveDirector(this, level.waves);
        this.enemyFactory = new EnemyFactory();
        this.towerFactory = new TowerFactory();
        this.spellbook = new Spellbook(this);
        this.enemies = new EntityList();
        this.projectiles = new EntityList();
        this.looseGems = new EntityList();
        this.effects = new EntityList();
        this.towers = [];
        this.sites = [
            ...this.battlefield.tilesOfTerrain('mine').map(tile => new GoldMine(this, tile)),
            ...this.battlefield.tilesOfTerrain('spring').map(tile => new ManaSpring(this, tile))
        ];
        this.tileMenu = new TileMenu(this);
        this.cursor = scene.add.graphics().setDepth(790);
        this.overlay = scene.add.graphics().setDepth(800);
        this.gemsLost = 0;
        this.outcome = null;
        this.starsEarned = 0;
    }

    update(dt) {
        if (this.outcome) return;
        this.treasury.update(dt);
        this.waveDirector.update(dt);
        this.sites.forEach(site => site.update(dt));
        this.enemies.update(dt);
        this.towers.forEach(tower => tower.update(dt));
        this.projectiles.update(dt);
        this.looseGems.update(dt);
        this.effects.update(dt);
        this.tileMenu.refresh();
        this.drawCursor();
        this.drawOverlay();
        this.checkOutcome();
    }

    spawnEnemy(kind, spawnIndex) {
        const routes = this.battlefield.routes;
        const route = routes[spawnIndex % routes.length];
        const healthScale = this.level.healthScale * (1 + this.healthGrowthPerWave * this.waveDirector.waveIndex);
        this.enemies.add(this.enemyFactory.create(kind, this, route, healthScale));
    }

    addProjectile(projectile) {
        this.projectiles.add(projectile);
    }

    addEffect(effect) {
        this.effects.add(effect);
    }

    notify(x, y, message, color) {
        this.addEffect(new FloatingText(this.scene, x, y, message, color));
    }

    enemiesWithin(x, y, radius) {
        return this.enemies.all.filter(enemy => enemy.alive && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius);
    }

    looseGemNear(x, y, radius) {
        return this.looseGems.all.find(gem => !gem.collected && Phaser.Math.Distance.Between(x, y, gem.x, gem.y) <= radius) || null;
    }

    handleKill(enemy, attacker) {
        if (attacker) attacker.creditKill();
        this.treasury.earnGold(enemy.goldReward);
        this.treasury.earnMana(enemy.manaReward);
        this.notify(enemy.x, enemy.y - 24, `+${enemy.goldReward}g`, '#ffd740');
        this.dropGems(enemy);
    }

    dropGems(enemy) {
        for (let gem = 0; gem < enemy.carriedGems; gem++) {
            const distance = Math.max(0, enemy.travelled - gem * this.gemDropSpacing);
            this.looseGems.add(new LooseGem(this.scene, enemy.route, distance, this.hoard));
        }
        enemy.carriedGems = 0;
    }

    handleEscape(enemy) {
        enemy.alive = false;
        if (enemy.carriedGems === 0) return;
        this.gemsLost += enemy.carriedGems;
        this.notify(enemy.x, enemy.y - 24, `-${enemy.carriedGems} gem${enemy.carriedGems > 1 ? 's' : ''}`, '#ff5252');
        enemy.carriedGems = 0;
    }

    handlePointerDown(pointer) {
        if (this.outcome) return;
        if (pointer.rightButtonDown()) {
            this.cancelSelection();
            return;
        }
        if (pointer.worldY >= this.battlefield.pixelHeight) return;
        if (this.spellbook.armedSpell) {
            this.spellbook.castAt(pointer.worldX, pointer.worldY);
            return;
        }
        this.selectTile(this.battlefield.tileAtWorld(pointer.worldX, pointer.worldY));
    }

    selectTile(tile) {
        if (!tile || tile === this.tileMenu.tile) {
            this.tileMenu.close();
            return;
        }
        if (tile.tower) {
            this.tileMenu.openForTower(tile, tile.tower);
            return;
        }
        if (tile.site) {
            this.tileMenu.openForSite(tile, tile.site);
            return;
        }
        const blueprint = this.towerFactory.blueprintFor(tile.terrain, this.progress);
        if (blueprint && this.battlefield.canBuildOn(tile)) {
            this.tileMenu.openForBuild(tile, blueprint);
            return;
        }
        this.tileMenu.close();
        if (tile.forested) {
            const center = this.battlefield.centerOf(tile);
            this.notify(center.x, center.y - 10, 'Overgrown: cast Clearcut [E]', '#b9f6a8');
        }
    }

    cancelSelection() {
        this.spellbook.disarm();
        this.tileMenu.close();
    }

    toggleSpell(spell) {
        if (this.outcome) return;
        this.tileMenu.close();
        this.spellbook.toggle(spell);
    }

    callWave() {
        if (this.outcome) return;
        const manaBonus = this.waveDirector.callEarly();
        if (manaBonus === 0) return;
        this.treasury.earnMana(manaBonus);
        this.notify(this.battlefield.pixelWidth / 2, this.battlefield.pixelHeight - 24, `Early call +${manaBonus} mana`, '#c9a6ff');
    }

    buildTower(tile, blueprint) {
        if (!this.battlefield.canBuildOn(tile) || !this.treasury.spendGold(blueprint.cost)) return;
        const tower = new blueprint.type(this, tile);
        this.towers.push(tower);
        this.tileMenu.close();
        this.addEffect(new Blast(this.scene, tower.x, tower.y, this.battlefield.tileSize * 0.8, 0xc58cff, false));
    }

    upgradeTower(tower) {
        if (!tower.canUpgrade || !tower.hasEnoughExperience || !this.treasury.spendGold(tower.upgradeCost)) return;
        tower.upgrade();
        this.addEffect(new Blast(this.scene, tower.x, tower.y, this.battlefield.tileSize, 0xffd740, false));
        this.tileMenu.openForTower(tower.tile, tower);
    }

    breakSeal(site) {
        if (!site.breakSeal()) return;
        this.tileMenu.openForSite(site.tile, site);
    }

    shatterTower(tower) {
        if (this.tileMenu.tile === tower.tile) this.tileMenu.close();
        this.towers = this.towers.filter(candidate => candidate !== tower);
        tower.destroy();
        this.addEffect(new Blast(this.scene, tower.x, tower.y, 44, 0xff3030));
        this.notify(tower.x, tower.y - 30, 'Spire shattered!', '#ff5252');
        this.scene.cameras.main.shake(450, 0.014);
    }

    sellTower(tower) {
        this.treasury.earnGold(tower.sellValue);
        this.notify(tower.x, tower.y - 20, `+${tower.sellValue}g`, '#ffd740');
        this.towers = this.towers.filter(candidate => candidate !== tower);
        this.tileMenu.close();
        tower.destroy();
    }

    drawCursor() {
        this.cursor.clear();
        const pointer = this.scene.input.activePointer;
        if (pointer.worldY >= this.battlefield.pixelHeight) return;
        const spell = this.spellbook.armedSpell;
        if (spell) {
            this.drawSpellCursor(spell, pointer.worldX, pointer.worldY);
            return;
        }
        const tile = this.battlefield.tileAtWorld(pointer.worldX, pointer.worldY);
        if (!tile) return;
        let color = null;
        if (tile.tower || tile.site) color = 0xffd740;
        else if (this.battlefield.canBuildOn(tile) && this.towerFactory.blueprintFor(tile.terrain, this.progress)) color = 0x69f0ae;
        if (color === null) return;
        this.strokeTile(tile, color);
    }

    drawSpellCursor(spell, x, y) {
        const color = spell.canCastAt(x, y) ? 0xb388ff : 0xff5252;
        if (spell.radius > 0) {
            this.cursor.fillStyle(color, 0.12);
            this.cursor.fillCircle(x, y, spell.radius);
            this.cursor.lineStyle(2, color, 0.9);
            this.cursor.strokeCircle(x, y, spell.radius);
            return;
        }
        const tile = this.battlefield.tileAtWorld(x, y);
        if (tile) this.strokeTile(tile, color);
    }

    strokeTile(tile, color) {
        const size = this.battlefield.tileSize;
        this.cursor.lineStyle(2, color, 0.85);
        this.cursor.strokeRect(tile.column * size + 1, tile.row * size + 1, size - 2, size - 2);
    }

    drawOverlay() {
        this.overlay.clear();
        const range = this.tileMenu.previewRange();
        if (range > 0) {
            const center = this.battlefield.centerOf(this.tileMenu.tile);
            this.overlay.fillStyle(0xffffff, 0.08);
            this.overlay.fillCircle(center.x, center.y, range);
            this.overlay.lineStyle(1, 0xffffff, 0.5);
            this.overlay.strokeCircle(center.x, center.y, range);
        }
        this.enemies.all.forEach(enemy => {
            if (!enemy.alive || enemy.health >= enemy.maxHealth) return;
            const barWidth = enemy.healthBarWidth;
            const left = enemy.x - barWidth / 2;
            const top = enemy.y - enemy.healthBarLift;
            this.overlay.fillStyle(0x000000, 0.7);
            this.overlay.fillRect(left - 1, top - 1, barWidth + 2, 5);
            this.overlay.fillStyle(enemy.healthRatio > 0.4 ? 0x69f0ae : 0xff5252, 1);
            this.overlay.fillRect(left, top, barWidth * enemy.healthRatio, 3);
        });
    }

    checkOutcome() {
        if (this.gemsLost >= this.hoard.total) {
            this.finish('defeat');
            return;
        }
        if (this.waveDirector.isFinished && this.enemies.size === 0) this.finish('victory');
    }

    get savedGems() {
        return this.hoard.total - this.gemsLost;
    }

    finish(outcome) {
        this.outcome = outcome;
        this.cancelSelection();
        this.cursor.clear();
        if (outcome !== 'victory') return;
        const saved = this.savedGems;
        if (saved === this.hoard.total) this.starsEarned = 3;
        else if (saved * 2 >= this.hoard.total) this.starsEarned = 2;
        else this.starsEarned = 1;
        this.progress.recordStars(this.levelIndex, this.starsEarned);
    }
}
