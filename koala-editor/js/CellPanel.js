class CellPanel {
    constructor(container, palette) {
        this.container = container;
        this.palette = palette;
        this.labels = ['bg', '%01 scr hi', '%10 scr lo', '%11 col ram'];
    }

    setPalette(palette) {
        this.palette = palette;
    }

    show(koala, cell) {
        if (cell === null) {
            this.container.textContent = 'Hover a cell to inspect its colors';
            return;
        }
        const column = cell % KoalaImage.COLUMNS;
        const row = Math.floor(cell / KoalaImage.COLUMNS);
        const lines = koala.cellSlots(cell).map(({ slot, color, pixels }) =>
            `<div class="slot"><span class="chip" style="background:${this.palette.css(color)}"></span>` +
            `${this.labels[slot]}: ${C64Palette.colorName(color)}, ${color} <em>${pixels} px</em></div>`);
        this.container.innerHTML = `<div>cell ${column},${row}</div>${lines.join('')}`;
    }
}
