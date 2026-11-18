class ColorPanel {
    constructor(container, primaryView, secondaryView, palette, onChange) {
        this.container = container;
        this.primaryView = primaryView;
        this.secondaryView = secondaryView;
        this.palette = palette;
        this.onChange = onChange;
        this.selected = [1, 0];
        this.swatches = [];
        this.build();
        this.refresh();
    }

    build() {
        for (let index = 0; index < 16; index++) {
            const swatch = document.createElement('button');
            swatch.className = 'swatch';
            swatch.title = `${index}: ${C64Palette.colorName(index)}`;
            swatch.textContent = index.toString(16).toUpperCase();
            swatch.addEventListener('click', () => this.select(ColorPanel.PRIMARY, index));
            swatch.addEventListener('contextmenu', event => {
                event.preventDefault();
                this.select(ColorPanel.SECONDARY, index);
            });
            this.container.appendChild(swatch);
            this.swatches.push(swatch);
        }
    }

    color(button) {
        return this.selected[button];
    }

    select(button, index) {
        this.selected[button] = index;
        this.refresh();
        this.onChange();
    }

    swap() {
        this.selected.reverse();
        this.refresh();
        this.onChange();
    }

    setPalette(palette) {
        this.palette = palette;
        this.refresh();
    }

    refresh() {
        this.swatches.forEach((swatch, index) => {
            swatch.style.background = this.palette.css(index);
            swatch.style.color = this.textColor(index);
            swatch.classList.toggle('primary', index === this.selected[ColorPanel.PRIMARY]);
            swatch.classList.toggle('secondary', index === this.selected[ColorPanel.SECONDARY]);
        });
        this.paintIndicator(this.primaryView, this.selected[ColorPanel.PRIMARY]);
        this.paintIndicator(this.secondaryView, this.selected[ColorPanel.SECONDARY]);
    }

    paintIndicator(view, index) {
        view.style.background = this.palette.css(index);
        view.style.color = this.textColor(index);
        view.textContent = `${C64Palette.colorName(index)}, ${index}`;
    }

    textColor(index) {
        const [r, g, b] = this.palette.rgb(index);
        return r * 0.299 + g * 0.587 + b * 0.114 > 140 ? '#000' : '#fff';
    }
}

ColorPanel.PRIMARY = 0;
ColorPanel.SECONDARY = 1;
