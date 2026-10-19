class KoalaViewerApp {
    constructor(document) {
        this.screen = document.getElementById('screen');
        this.status = document.getElementById('status');
        this.paletteSelect = document.getElementById('palette');
        this.canvas = document.getElementById('canvas');
        this.palettes = C64Palette.all();
        this.renderer = new KoalaRenderer(this.canvas, this.palettes[0]);
        this.dropZone = new DropZone(document.body, this.screen, document.getElementById('file'), files => this.open(files));
        this.files = [];
        this.current = 0;
        this.koala = null;
        this.fileCaption = '';
        this.hoveredPixel = null;
        this.setupPaletteSelect();
        this.setupPixelTracking();
        document.addEventListener('keydown', event => this.onKey(event));
    }

    setupPaletteSelect() {
        this.palettes.forEach((palette, index) => this.paletteSelect.add(new Option(palette.name, index)));
        this.paletteSelect.addEventListener('change', () => {
            this.renderer.palette = this.palettes[this.paletteSelect.value];
            this.draw();
        });
    }

    setupPixelTracking() {
        this.canvas.addEventListener('mousemove', event => this.hover(this.renderer.pixelAt(event)));
        this.canvas.addEventListener('mouseleave', () => this.hover(null));
    }

    hover(pixel) {
        this.hoveredPixel = pixel;
        this.updateCaption();
    }

    onKey(event) {
        if (this.files.length < 2) return;
        if (event.key === 'ArrowRight') this.show(this.current + 1);
        if (event.key === 'ArrowLeft') this.show(this.current - 1);
    }

    open(files) {
        this.files = files;
        this.show(0);
    }

    async show(index) {
        this.current = (index + this.files.length) % this.files.length;
        const file = this.files[this.current];
        try {
            this.koala = KoalaImage.fromBytes(new Uint8Array(await file.arrayBuffer()));
            this.draw();
            this.screen.classList.add('loaded');
            this.fileCaption = `${this.position()}${file.name} - ${file.size} bytes - background ${this.describeColor(this.koala.background)}`;
        } catch (error) {
            this.koala = null;
            this.fileCaption = `${this.position()}${file.name}: ${error.message}`;
        }
        this.updateCaption();
    }

    updateCaption() {
        const pixel = this.hoveredPixel;
        const pixelCaption = this.koala && pixel
            ? ` - pixel (${pixel.x},${pixel.y}) is ${this.describeColor(this.koala.colorAt(pixel.x, pixel.y))}`
            : '';
        this.status.textContent = this.fileCaption + pixelCaption;
    }

    describeColor(index) {
        return `${C64Palette.colorName(index)}, ${index}`;
    }

    position() {
        return this.files.length > 1 ? `[${this.current + 1}/${this.files.length}, ←/→] ` : '';
    }

    draw() {
        if (!this.koala) return;
        this.renderer.render(this.koala);
        this.screen.style.background = this.renderer.palette.css(this.koala.background);
    }
}

window.addEventListener('DOMContentLoaded', () => new KoalaViewerApp(document));
