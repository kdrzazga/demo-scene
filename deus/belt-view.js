class BeltView extends HudPanel {
    constructor({
        slotCount = 10,
        slotSize = 56,
        gap = 4,
        padding = 8,
        margin = 16,
        labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ...style
    } = {}) {
        super({
            panelWidth: padding * 2 + slotCount * slotSize + (slotCount - 1) * gap,
            panelHeight: padding * 2 + slotSize,
            ...style,
        });
        this.slotCount = slotCount;
        this.slotSize = slotSize;
        this.gap = gap;
        this.padding = padding;
        this.margin = margin;
        this.labels = labels;
        this.slots = new Array(slotCount).fill(null);
        this.draw();
    }

    addItem(item) {
        const index = this.slots.indexOf(null);
        if (index < 0) return false;
        this.slots[index] = item;
        this.draw();
        return true;
    }

    clear() {
        this.slots.fill(null);
        this.draw();
    }

    layout(viewportWidth, viewportHeight) {
        this.group.position.set(viewportWidth / 2, -(viewportHeight - this.margin - this.height / 2), 0);
    }

    drawContent(c) {
        for (let index = 0; index < this.slotCount; index++) {
            const x = this.padding + index * (this.slotSize + this.gap), y = this.padding;
            this.drawSlot(c, x, y, this.slotSize, this.slotSize);
            this.slots[index]?.paintIcon(c, x, y, this.slotSize);
            this.drawLabel(c, this.labels[index] ?? '', x + this.slotSize - 4, y + 3, { size: 11, bold: true, align: 'right', baseline: 'top', color: '#8fa1ad' });
        }
    }
}
