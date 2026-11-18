class SealedSite {
    constructor(battle, tile) {
        const profile = this.describe();
        this.battle = battle;
        this.tile = tile;
        this.title = profile.title;
        this.sealCount = 3;
        this.sealCost = 50;
        this.sealCurrency = profile.sealCurrency;
        this.brokenSeals = 0;
        this.payoutTimer = 0;
        this.sealedTint = 0x7a6f8a;
        this.sealSpacing = 9;
        this.sealRadius = 3.5;
        const center = battle.battlefield.centerOf(tile);
        this.x = center.x;
        this.y = center.y;
        this.sprite = battle.scene.add.image(this.x, this.y, profile.texture).setDepth(100 + this.y).setTint(this.sealedTint);
        this.sealGraphics = battle.scene.add.graphics().setDepth(101 + this.y);
        this.drawSeals();
        tile.site = this;
    }

    describe() {
        throw new Error('Sealed sites must describe themselves');
    }

    describeProduction() {
        throw new Error('Sealed sites must describe their production');
    }

    payout() {
        throw new Error('Sealed sites must pay out');
    }

    get payoutInterval() {
        throw new Error('Sealed sites must define a payout interval');
    }

    get isOpen() {
        return this.brokenSeals >= this.sealCount;
    }

    get remainingSeals() {
        return this.sealCount - this.brokenSeals;
    }

    describeStatus() {
        if (this.isOpen) return `${this.title}\n${this.describeProduction()}`;
        return `${this.title}\nSealed: ${this.remainingSeals} of ${this.sealCount} seals left\nWhen open: ${this.describeProduction()}`;
    }

    get sealPriceLabel() {
        return this.sealCurrency === 'mana' ? `${this.sealCost} mana` : `${this.sealCost}g`;
    }

    canAffordSeal() {
        const treasury = this.battle.treasury;
        return (this.sealCurrency === 'mana' ? treasury.mana : treasury.gold) >= this.sealCost;
    }

    paySeal() {
        const treasury = this.battle.treasury;
        return this.sealCurrency === 'mana' ? treasury.spendMana(this.sealCost) : treasury.spendGold(this.sealCost);
    }

    breakSeal() {
        if (this.isOpen || !this.paySeal()) return false;
        this.brokenSeals += 1;
        this.drawSeals();
        this.battle.addEffect(new Blast(this.battle.scene, this.x, this.y - 18, 16, 0xffd740, false));
        if (this.isOpen) {
            this.sprite.clearTint();
            this.battle.addEffect(new Blast(this.battle.scene, this.x, this.y, 36, 0xffffff));
            this.battle.notify(this.x, this.y - 30, `${this.title} unsealed!`, '#ffffff');
        }
        return true;
    }

    update(dt) {
        if (!this.isOpen) return;
        this.payoutTimer += dt;
        if (this.payoutTimer < this.payoutInterval) return;
        this.payoutTimer -= this.payoutInterval;
        this.payout();
    }

    drawSeals() {
        this.sealGraphics.clear();
        if (this.isOpen) return;
        const sealsY = this.y - 20;
        for (let seal = 0; seal < this.sealCount; seal++) {
            const sealX = this.x + (seal - (this.sealCount - 1) / 2) * this.sealSpacing;
            if (seal < this.brokenSeals) {
                this.sealGraphics.lineStyle(1, 0x5a5066, 1);
                this.sealGraphics.strokeCircle(sealX, sealsY, this.sealRadius);
            } else {
                this.sealGraphics.fillStyle(0xb3122e, 1);
                this.sealGraphics.fillCircle(sealX, sealsY, this.sealRadius);
                this.sealGraphics.lineStyle(1, 0xffd740, 1);
                this.sealGraphics.strokeCircle(sealX, sealsY, this.sealRadius);
            }
        }
    }
}

class GoldMine extends SealedSite {
    constructor(battle, tile) {
        super(battle, tile);
        this.goldPerPayout = 6;
        this.secondsPerPayout = 4;
    }

    describe() {
        return { title: 'Gold Mine', texture: 'mine', sealCurrency: 'mana' };
    }

    get payoutInterval() {
        return this.secondsPerPayout;
    }

    describeProduction() {
        return `+${this.goldPerPayout} gold every ${this.secondsPerPayout}s`;
    }

    payout() {
        this.battle.treasury.earnGold(this.goldPerPayout);
        this.battle.notify(this.x, this.y - 22, `+${this.goldPerPayout}g`, '#ffd740');
    }
}

class ManaSpring extends SealedSite {
    constructor(battle, tile) {
        super(battle, tile);
        this.manaPerPayout = 3;
        this.secondsPerPayout = 2;
    }

    describe() {
        return { title: 'Mana Spring', texture: 'spring', sealCurrency: 'gold' };
    }

    get payoutInterval() {
        return this.secondsPerPayout;
    }

    describeProduction() {
        return `+${this.manaPerPayout} mana every ${this.secondsPerPayout}s`;
    }

    payout() {
        this.battle.treasury.earnMana(this.manaPerPayout);
        this.battle.notify(this.x, this.y - 22, `+${this.manaPerPayout} mana`, '#c9a6ff');
    }
}
