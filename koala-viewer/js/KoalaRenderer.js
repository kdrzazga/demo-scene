class KoalaRenderer {
    constructor(canvas, palette) {
        this.canvas = canvas;
        this.palette = palette;
        this.canvas.width = KoalaImage.WIDTH * 2;
        this.canvas.height = KoalaImage.HEIGHT;
        this.context = canvas.getContext('2d');
    }

    pixelAt(event) {
        const bounds = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - bounds.left) / bounds.width * KoalaImage.WIDTH);
        const y = Math.floor((event.clientY - bounds.top) / bounds.height * KoalaImage.HEIGHT);
        if (x < 0 || y < 0 || x >= KoalaImage.WIDTH || y >= KoalaImage.HEIGHT) return null;
        return { x, y };
    }

    render(koala) {
        const imageData = this.context.createImageData(this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        for (let y = 0; y < KoalaImage.HEIGHT; y++) {
            for (let x = 0; x < KoalaImage.WIDTH; x++) {
                const [r, g, b] = this.palette.rgb(koala.colorAt(x, y));
                const index = (y * this.canvas.width + x * 2) * 4;
                pixels.set([r, g, b, 255, r, g, b, 255], index);
            }
        }
        this.context.putImageData(imageData, 0, 0);
    }
}
