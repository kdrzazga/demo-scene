class EditorView {
    constructor(canvas, palette, zoom = 3) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.buffer = document.createElement('canvas');
        this.buffer.width = KoalaImage.WIDTH * 2;
        this.buffer.height = KoalaImage.HEIGHT;
        this.bufferContext = this.buffer.getContext('2d');
        this.imageData = this.bufferContext.createImageData(this.buffer.width, this.buffer.height);
        this.palette = palette;
        this.zoom = zoom;
        this.minZoom = 1;
        this.maxZoom = 10;
        this.showPixelGrid = false;
        this.showCellGrid = true;
        this.hoverCell = null;
        this.flashes = new Map();
        this.flashDuration = 400;
        this.resize();
    }

    resize() {
        this.canvas.width = this.buffer.width * this.zoom;
        this.canvas.height = this.buffer.height * this.zoom;
    }

    setZoom(zoom) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
        this.resize();
    }

    pixelAt(event) {
        const bounds = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - bounds.left) / bounds.width * KoalaImage.WIDTH);
        const y = Math.floor((event.clientY - bounds.top) / bounds.height * KoalaImage.HEIGHT);
        return { x, y };
    }

    flash(cell) {
        this.flashes.set(cell, performance.now() + this.flashDuration);
    }

    hasFlashes() {
        return this.flashes.size > 0;
    }

    draw(koala) {
        this.renderImage(koala);
        this.context.imageSmoothingEnabled = false;
        this.context.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
        if (this.showPixelGrid && this.zoom >= 3) this.drawGrid(2 * this.zoom, this.zoom, 'rgba(255, 255, 255, 0.08)');
        if (this.showCellGrid) this.drawGrid(8 * this.zoom, 8 * this.zoom, 'rgba(255, 255, 255, 0.22)');
        if (this.hoverCell !== null) this.outlineCell(this.hoverCell, 'rgba(255, 255, 255, 0.8)');
        this.drawFlashes();
    }

    renderImage(koala) {
        const pixels = this.imageData.data;
        for (let y = 0; y < KoalaImage.HEIGHT; y++) {
            for (let x = 0; x < KoalaImage.WIDTH; x++) {
                const [r, g, b] = this.palette.rgb(koala.colorAt(x, y));
                const index = (y * this.buffer.width + x * 2) * 4;
                pixels[index] = pixels[index + 4] = r;
                pixels[index + 1] = pixels[index + 5] = g;
                pixels[index + 2] = pixels[index + 6] = b;
                pixels[index + 3] = pixels[index + 7] = 255;
            }
        }
        this.bufferContext.putImageData(this.imageData, 0, 0);
    }

    drawGrid(stepX, stepY, color) {
        this.context.strokeStyle = color;
        this.context.lineWidth = 1;
        this.context.beginPath();
        for (let x = stepX; x < this.canvas.width; x += stepX) {
            this.context.moveTo(x + 0.5, 0);
            this.context.lineTo(x + 0.5, this.canvas.height);
        }
        for (let y = stepY; y < this.canvas.height; y += stepY) {
            this.context.moveTo(0, y + 0.5);
            this.context.lineTo(this.canvas.width, y + 0.5);
        }
        this.context.stroke();
    }

    outlineCell(cell, color) {
        const size = 8 * this.zoom;
        const x = (cell % KoalaImage.COLUMNS) * size;
        const y = Math.floor(cell / KoalaImage.COLUMNS) * size;
        this.context.strokeStyle = color;
        this.context.lineWidth = 2;
        this.context.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }

    drawFlashes() {
        const now = performance.now();
        for (const [cell, until] of this.flashes) {
            if (until < now) {
                this.flashes.delete(cell);
                continue;
            }
            this.outlineCell(cell, 'rgba(255, 60, 60, 0.95)');
        }
    }
}
