class Bestiary {
    constructor(scene, level, enemyFactory) {
        this.scene = scene;
        this.healthScale = level.healthScale;
        this.cycleSeconds = 15;
        this.width = 236;
        this.height = 218;
        this.margin = 8;
        this.padding = 10;
        this.depth = 970;
        this.portraitScale = 2;
        this.portraitBoxWidth = 56;
        this.portraitBoxHeight = 70;
        this.hoverAlpha = 0.12;
        this.fadeSpeed = 6;
        this.alpha = 1;
        this.parts = [];
        this.entries = this.collectEntries(level, enemyFactory);
        this.index = 0;
        this.elapsed = 0;
        this.left = scene.scale.width - this.width - this.margin;
        this.top = this.margin;
        this.createFrame();
        this.showEntry();
    }

    collectEntries(level, enemyFactory) {
        const kinds = [...new Set(level.waves.flat().map(group => group.enemy))];
        return kinds.map(kind => enemyFactory.describe(kind));
    }

    addPart(gameObject) {
        this.parts.push(gameObject);
        return gameObject;
    }

    createFrame() {
        const left = this.left;
        const top = this.top;
        const textLeft = left + 76;
        const smallStyle = { fontFamily: 'monospace', fontSize: '11px', color: '#b9a6cc' };
        this.addPart(this.scene.add.rectangle(left, top, this.width, this.height, 0x1d1428, 0.88)
            .setOrigin(0)
            .setStrokeStyle(1, 0x8a6fb5)
            .setDepth(this.depth));
        this.addPart(this.scene.add.text(left + this.padding, top + 8, 'HEROES ON THIS MAP', smallStyle).setDepth(this.depth + 1));
        this.counterText = this.addPart(this.scene.add.text(left + this.width - this.padding, top + 8, '', smallStyle)
            .setOrigin(1, 0)
            .setDepth(this.depth + 1));
        this.addPart(this.scene.add.rectangle(left + this.padding, top + 28, this.portraitBoxWidth, this.portraitBoxHeight, 0x2a2233)
            .setOrigin(0)
            .setStrokeStyle(1, 0x5b3f7a)
            .setDepth(this.depth + 1));
        this.portrait = this.addPart(this.scene.add.image(left + this.padding + 28, top + 63, '__DEFAULT')
            .setScale(this.portraitScale)
            .setDepth(this.depth + 2));
        this.nameText = this.addPart(this.scene.add.text(textLeft, top + 26, '', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffe9a8'
        }).setDepth(this.depth + 1));
        this.statsText = this.addPart(this.scene.add.text(textLeft, top + 48, '', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#e8dcf5',
            lineSpacing: 2
        }).setDepth(this.depth + 1));
        this.weaknessText = this.addPart(this.scene.add.text(left + this.padding, top + 126, '', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#ff9a8a',
            lineSpacing: 2,
            wordWrap: { width: this.width - this.padding * 2 }
        }).setDepth(this.depth + 1));
        this.timerGraphics = this.addPart(this.scene.add.graphics().setDepth(this.depth + 1));
    }

    showEntry() {
        const profile = this.entries[this.index];
        this.counterText.setText(`${this.index + 1}/${this.entries.length}`);
        this.portrait.setTexture(profile.texture);
        const fittingScale = Math.min(
            this.portraitScale,
            (this.portraitBoxWidth - 4) / this.portrait.frame.width,
            (this.portraitBoxHeight - 4) / this.portrait.frame.height
        );
        this.portrait.setScale(fittingScale);
        this.nameText.setText(profile.name);
        const gemWord = profile.capacity > 1 ? 'gems' : 'gem';
        this.statsText.setText([
            `Health  ${Math.round(profile.health * this.healthScale)}`,
            `Speed   ${profile.speed}`,
            `Armor   ${profile.armor}`,
            `Carries ${profile.capacity} ${gemWord}`,
            `Bounty  ${profile.goldReward}g ${profile.manaReward} mana`
        ].join('\n'));
        this.weaknessText.setText(`Weakness: ${profile.weakness}`);
    }

    isPointerOver() {
        const pointer = this.scene.input.activePointer;
        return pointer.x >= this.left && pointer.x <= this.left + this.width &&
            pointer.y >= this.top && pointer.y <= this.top + this.height;
    }

    update(dt) {
        this.updateFade(dt);
        if (this.entries.length === 0) return;
        this.elapsed += dt;
        if (this.elapsed >= this.cycleSeconds) {
            this.elapsed -= this.cycleSeconds;
            this.index = (this.index + 1) % this.entries.length;
            this.showEntry();
        }
        this.drawTimer();
    }

    updateFade(dt) {
        const targetAlpha = this.isPointerOver() ? this.hoverAlpha : 1;
        if (this.alpha === targetAlpha) return;
        const step = this.fadeSpeed * dt;
        this.alpha = targetAlpha < this.alpha
            ? Math.max(targetAlpha, this.alpha - step)
            : Math.min(targetAlpha, this.alpha + step);
        this.parts.forEach(part => part.setAlpha(this.alpha));
    }

    drawTimer() {
        const barWidth = this.width - this.padding * 2;
        const barTop = this.top + this.height - 8;
        this.timerGraphics.clear();
        this.timerGraphics.fillStyle(0x2a1f38, 1);
        this.timerGraphics.fillRect(this.left + this.padding, barTop, barWidth, 3);
        this.timerGraphics.fillStyle(0x8a6fb5, 1);
        this.timerGraphics.fillRect(this.left + this.padding, barTop, barWidth * (1 - this.elapsed / this.cycleSeconds), 3);
    }
}
