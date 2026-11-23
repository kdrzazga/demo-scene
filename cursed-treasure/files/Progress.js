class Progress {
    constructor(levelCount, pactCatalog) {
        this.storageKey = 'hoardkeeper.progress.v1';
        this.pactCatalog = pactCatalog;
        this.bestStars = new Array(levelCount).fill(0);
        this.pactRanks = new Map();
        this.allLevelsUnlocked = this.readCheat() === 'all-levels';
        this.load();
    }

    readCheat() {
        try {
            return new URLSearchParams(window.location.search).get('cheat');
        } catch (error) {
            return null;
        }
    }

    load() {
        try {
            const saved = JSON.parse(window.localStorage.getItem(this.storageKey) || 'null');
            if (!saved) return;
            (saved.bestStars || []).forEach((stars, index) => {
                if (index < this.bestStars.length) this.bestStars[index] = stars;
            });
            if (saved.pactRanks) this.pactRanks = new Map(Object.entries(saved.pactRanks));
            else this.pactRanks = new Map((saved.unlockedPacts || []).map(key => [key, 1]));
            if (this.spentPoints > this.earnedPoints) this.pactRanks.clear();
        } catch (error) {
            this.pactRanks = new Map();
        }
    }

    save() {
        try {
            window.localStorage.setItem(this.storageKey, JSON.stringify({
                bestStars: this.bestStars,
                pactRanks: Object.fromEntries(this.pactRanks)
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
        return this.allLevelsUnlocked || levelIndex === 0 || this.bestStars[levelIndex - 1] > 0;
    }

    get earnedPoints() {
        return this.bestStars.filter(stars => stars > 0).length;
    }

    get spentPoints() {
        return [...this.pactRanks.values()].reduce((sum, rank) => sum + rank, 0);
    }

    get freePoints() {
        return Math.max(0, this.earnedPoints - this.spentPoints);
    }

    pactRank(key) {
        return this.pactRanks.get(key) || 0;
    }

    maxPactRank(key) {
        const pact = this.pactCatalog.find(key);
        return pact ? pact.ranks.length : 0;
    }

    canRankUpPact(key) {
        return this.freePoints > 0 && this.pactRank(key) < this.maxPactRank(key);
    }

    rankUpPact(key) {
        if (!this.canRankUpPact(key)) return false;
        this.pactRanks.set(key, this.pactRank(key) + 1);
        this.save();
        return true;
    }

    pactEffect(key) {
        const rank = this.pactRank(key);
        const pact = this.pactCatalog.find(key);
        if (rank === 0 || !pact) return null;
        return pact.ranks[rank - 1].value;
    }

    resetPacts() {
        this.pactRanks.clear();
        this.save();
    }

    damageMultiplier(race) {
        return 1 + (this.pactEffect(`${race}.damage`) || 0);
    }

    rangeMultiplier(race) {
        return 1 + (this.pactEffect(`${race}.range`) || 0);
    }

    formatStars(count) {
        return '★'.repeat(count) + '☆'.repeat(3 - count);
    }
}
