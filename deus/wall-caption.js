class WallCaption extends WallDecal {
    constructor({
        lines = [],
        width = 4,
        height = 1,
        resolution = 256,
        color = '#d8dde2',
        shadow = 'rgba(0, 0, 0, 0.85)',
        font = 'bold {size}px Arial, Helvetica, sans-serif',
        spacing = 6,
        ...options
    } = {}) {
        super({
            width,
            height,
            content: { lines, color, shadow, font, spacing, pixelsPerMeter: resolution },
            ...options,
            material: { alphaTest: 0.3, roughness: 0.5, metalness: 0.3 },
        });
    }

    source() {
        const { lines, color, shadow, font, spacing, pixelsPerMeter } = this.content;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(this.width * pixelsPerMeter);
        canvas.height = Math.round(this.height * pixelsPerMeter);
        const c = canvas.getContext('2d');
        const lineHeight = canvas.height / lines.length;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.letterSpacing = `${spacing}px`;
        lines.forEach((line, index) => {
            const size = Math.round(lineHeight * (index === 0 ? 0.72 : 0.52));
            c.font = font.replace('{size}', size);
            const x = canvas.width / 2 + spacing / 2, y = lineHeight * (index + 0.5);
            c.fillStyle = shadow;
            c.fillText(line, x + 3, y + 3);
            c.fillStyle = color;
            c.fillText(line, x, y);
        });
        return canvas;
    }
}
