class City {

    constructor(ruleset, map) {
        this.ruleset = ruleset;
        this.map = map;
        this.level = 1;
        this.entertainers = 0;
        this.foodStore = 0;
        this.gold = 0;
        this.turn = 1;
        this.famineTurns = 0;
        this.buildings = [];
        this.available = ruleset.newBuildings();
        this.current = this.available[0];
        this.report = 'City founded on ' + map.centerTile().terrain.name.toLowerCase() + '.';
    }

    workedTiles() {
        const tiles = this.map.controlledTiles(this.level);
        tiles.push(this.map.centerTile());
        return tiles;
    }

    controlledWaterTiles() {
        return this.workedTiles().filter(t => t.terrain.key === 'water').length;
    }

    workers() {
        return this.level - this.entertainers;
    }

    setEntertainers(n) {
        this.entertainers = Math.max(0, Math.min(this.level, n));
    }

    baseYield() {
        const y = { food: 0, shields: 0, trade: 0 };
        this.workedTiles().forEach(t => {
            y.food += t.terrain.food;
            y.shields += t.terrain.shields;
            y.trade += t.terrain.trade;
        });
        return y;
    }

    yields() {
        const y = this.baseYield();
        y.shields = Math.round(y.shields * this.workers() / this.level);
        this.buildings.forEach(b => {
            y.food += b.foodBonus(this);
            y.trade += b.tradeBonus(this);
        });
        let gold = y.trade;
        this.buildings.forEach(b => gold += b.goldBonus(y.trade));
        y.gold = gold;
        return y;
    }

    contentLimit() {
        let limit = this.ruleset.contentBase + this.entertainers * this.ruleset.luxuryPerEntertainer;
        this.buildings.forEach(b => limit += b.happyBonus());
        return limit;
    }

    inDisorder() {
        return this.level > this.contentLimit();
    }

    hasAqueduct() {
        return this.buildings.some(b => b.removesGrowthCap());
    }

    famineBuffer() {
        return Math.max(0, ...this.buildings.map(b => b.famineBuffer()), 0);
    }

    keepsFoodOnGrowth() {
        return this.buildings.some(b => b.keepsFoodOnGrowth());
    }

    canGrow() {
        return this.hasAqueduct() || this.level < this.ruleset.growthCap;
    }

    setConstruction(key) {
        const found = this.available.find(b => b.key === key);
        if (found) this.current = found;
    }

    rushCost() {
        if (!this.current) return 0;
        return this.current.remaining() * this.ruleset.rushGoldPerShield;
    }

    rush() {
        if (!this.current || this.current.isDone() || this.gold < this.rushCost()) return false;
        this.gold -= this.rushCost();
        this.current.addShields(this.current.remaining());
        this._finalizeCurrent();
        return true;
    }

    processTurn() {
        this.turn++;
        if (this.inDisorder()) {
            this.report = 'Disorder — angry citizens, nothing gets done.';
            return;
        }
        const y = this.yields();
        this.gold += y.gold;
        this._processConstruction(y.shields);
        this._processFood(y.food);
    }

    _finalizeCurrent() {
        if (!this.current || !this.current.isDone()) return;
        const finished = this.current;
        this.buildings.push(finished);
        this.available = this.available.filter(b => b.key !== finished.key);
        this.current = this.available.length ? this.available[0] : null;
        this.report = finished.name + ' completed.';
    }

    _processConstruction(shields) {
        if (!this.current) return;
        if (this.current.isProcess()) {
            this.current.applyShields(this, shields);
            this.report = 'Wealth — ' + shields + ' shields sold for gold.';
            return;
        }
        if (!this.current.isDone()) this.current.addShields(shields);
        this._finalizeCurrent();
    }

    _processFood(food) {
        const surplus = food - this.level * this.ruleset.foodPerCitizen;
        if (surplus >= 0) {
            this.famineTurns = 0;
            this.foodStore += surplus;
            this._maybeGrow();
        } else if (this.famineTurns < this.famineBuffer()) {
            this.famineTurns++;
            this.report = 'Famine held off by the granary.';
        } else {
            this._starve();
        }
    }

    _starve() {
        this.famineTurns = 0;
        this.foodStore = 0;
        if (this.level > 1) {
            this.level--;
            if (this.entertainers > this.level) this.entertainers = this.level;
            this.report = 'Famine! The city starves down to level ' + this.level + '.';
        } else {
            this.report = 'Famine! The city clings to level 1.';
        }
    }

    _maybeGrow() {
        const needed = this.ruleset.foodNeeded(this.level);
        if (this.foodStore < needed) return;
        if (!this.canGrow()) {
            this.foodStore = needed;
            this.report = 'Full storehouse — build an Aqueduct to grow past level ' + this.ruleset.growthCap + '.';
            return;
        }
        const overflow = this.foodStore - needed;
        this.level++;
        const next = this.ruleset.foodNeeded(this.level);
        this.foodStore = (this.keepsFoodOnGrowth() ? Math.floor(next / 2) : 0) + overflow;
        if (!this.report.endsWith('completed.')) this.report = 'City grew to level ' + this.level + '.';
    }
}
