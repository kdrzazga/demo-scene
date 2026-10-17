class InventoryView extends HudPanel {
    constructor({
        columns = 6,
        rows = 5,
        cellSize = 56,
        gap = 4,
        padding = 12,
        spacing = 10,
        infoWidth = 360,
        titleHeight = 28,
        tabHeight = 26,
        buttonHeight = 26,
        bottomOffset = 120,
        margin = 16,
        title = 'INVENTORY',
        credits = 0,
        tabs = ['INVENTORY', 'HEALTH', 'AUGMENTATIONS', 'SKILLS', 'GOALS/NOTES', 'CONVERSATIONS', 'IMAGES', 'LOGS'],
        activeTab = 0,
        buttons = ['EQUIP', 'USE', 'DROP', 'CHANGE AMMO'],
        visible = false,
        ...style
    } = {}) {
        const gridWidth = columns * cellSize + (columns - 1) * gap;
        const gridHeight = rows * cellSize + (rows - 1) * gap;
        super({
            panelWidth: padding * 2 + gridWidth + spacing + infoWidth,
            panelHeight: padding * 2 + titleHeight + tabHeight + gridHeight + buttonHeight + spacing * 3,
            ...style,
        });
        this.columns = columns;
        this.rows = rows;
        this.cellSize = cellSize;
        this.gap = gap;
        this.padding = padding;
        this.spacing = spacing;
        this.infoWidth = infoWidth;
        this.titleHeight = titleHeight;
        this.tabHeight = tabHeight;
        this.buttonHeight = buttonHeight;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.bottomOffset = bottomOffset;
        this.margin = margin;
        this.title = title;
        this.credits = credits;
        this.tabs = tabs;
        this.activeTab = activeTab;
        this.buttons = buttons;
        this.group.position.z = 2;
        this.group.visible = visible;
        this.draw();
    }

    show() {
        this.group.visible = true;
    }

    hide() {
        this.group.visible = false;
    }

    toggle() {
        this.group.visible = !this.group.visible;
    }

    layout(viewportWidth, viewportHeight) {
        const availableHeight = viewportHeight - this.bottomOffset - this.margin;
        const scale = Math.min(1, availableHeight / this.height, (viewportWidth - this.margin * 2) / this.width);
        const bottom = viewportHeight - this.bottomOffset;
        this.group.scale.setScalar(scale);
        this.group.position.x = viewportWidth / 2;
        this.group.position.y = -(bottom - this.height * scale / 2);
    }

    get tabsTop() {
        return this.padding + this.titleHeight + this.spacing;
    }

    get gridTop() {
        return this.tabsTop + this.tabHeight + this.spacing;
    }

    get buttonsTop() {
        return this.gridTop + this.gridHeight + this.spacing;
    }

    drawContent(c) {
        this.drawTitle(c);
        this.drawTabs(c);
        this.drawGrid(c);
        this.drawButtons(c);
        this.drawInfo(c);
    }

    drawTitle(c) {
        const x = this.padding, y = this.padding, w = this.panelWidth - this.padding * 2, h = this.titleHeight;
        this.drawStrip(c, x, y, w, h);
        this.drawLabel(c, this.title, x + 10, y + h / 2 + 1, { size: 15, bold: true, spacing: 2 });
        this.drawLabel(c, `CREDITS: ${this.credits}`, x + w - 10, y + h / 2 + 1, { size: 12, bold: true, align: 'right', color: '#8fa1ad', spacing: 1 });
    }

    drawTabs(c) {
        const tabGap = 3;
        const totalWidth = this.panelWidth - this.padding * 2;
        const tabWidth = (totalWidth - tabGap * (this.tabs.length - 1)) / this.tabs.length;
        this.tabs.forEach((label, index) => {
            const x = this.padding + index * (tabWidth + tabGap), active = index === this.activeTab;
            this.drawStrip(c, x, this.tabsTop, tabWidth, this.tabHeight, active);
            this.drawLabel(c, label, x + tabWidth / 2, this.tabsTop + this.tabHeight / 2 + 1, { size: 10, bold: true, align: 'center', color: active ? '#ffffff' : '#8fa1ad' });
        });
    }

    drawGrid(c) {
        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                const x = this.padding + column * (this.cellSize + this.gap);
                const y = this.gridTop + row * (this.cellSize + this.gap);
                this.drawSlot(c, x, y, this.cellSize, this.cellSize);
            }
        }
    }

    drawButtons(c) {
        const buttonGap = 4;
        const buttonWidth = (this.gridWidth - buttonGap * (this.buttons.length - 1)) / this.buttons.length;
        this.buttons.forEach((label, index) => {
            const x = this.padding + index * (buttonWidth + buttonGap);
            this.drawStrip(c, x, this.buttonsTop, buttonWidth, this.buttonHeight);
            this.drawLabel(c, label, x + buttonWidth / 2, this.buttonsTop + this.buttonHeight / 2 + 1, { size: 11, bold: true, align: 'center', color: 'rgba(143, 161, 173, 0.6)' });
        });
    }

    drawInfo(c) {
        const x = this.padding + this.gridWidth + this.spacing, y = this.gridTop;
        const height = this.buttonsTop + this.buttonHeight - this.gridTop;
        this.drawStrip(c, x, y, this.infoWidth, this.tabHeight);
        this.drawSlot(c, x, y + this.tabHeight + this.spacing, this.infoWidth, height - this.tabHeight - this.spacing);
    }
}
