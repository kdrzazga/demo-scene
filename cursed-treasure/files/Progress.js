class Progress {
    constructor(levelCount) {
        this.storageKey = 'hoardkeeper.progress.v1';
        this.damageBonus = 1.25;
        this.rangeBonus = 1.15;
        this.bestStars = new Array(levelCount).fill(0);
        this.unlockedPacts = new Set();
        this.load();
    }

    load() {
        try {
            const saved = JSON.parse(window.localStorage.getItem(this.storageKey) || 'null');
            if (!saved) return;
            (saved.bestStars || []).forEach((stars, index) => {
                if (index < this.bestStars.length) this.bestStars[index] = stars;
            });
            this.unlockedPacts = new Set(saved.unlockedPacts || []);
        } catch (error) {
            this.unlockedPacts = new Set();
        }
    }

    save() {
        try {
            window.localStorage.setItem(this.storageKey, JSON.stringify({
                bestStars: this.bestStars,
                unlockedPacts: [...this.unlockedPacts]
            }));
        } catch (error) {
            return;
        }
    }

    recordStars(levelIndex, stars) {
        if (stars <= this.bestStars[levelIndex]) return;
        this.bestStars[levelIndex] = stars;
        this.save();
    }

    isLevelOpen(levelIndex) {
        return levelIndex === 0 || this.bestStars[levelIndex - 1] > 0;
    }

    get earnedPoints() {
        return this.bestStars.reduce((sum, stars) => sum + stars, 0);
    }

    get freePoints() {
        return Math.max(0, this.earnedPoints - this.unlockedPacts.size);
    }

    hasPact(key) {
        return this.unlockedPacts.has(key);
    }

    unlockPact(key) {
        if (this.hasPact(key) || this.freePoints <= 0) return false;
        this.unlockedPacts.add(key);
        this.save();
        return true;
    }

    resetPacts() {
        this.unlockedPacts.clear();
        this.save();
    }

    damageMultiplier(race) {
        return this.hasPact(`${race}.damage`) ? this.damageBonus : 1;
    }

    rangeMultiplier(race) {
        return this.hasPact(`${race}.range`) ? this.rangeBonus : 1;
    }

    formatStars(count) {
        return '★'.repeat(count) + '☆'.repeat(3 - count);
    }
}
