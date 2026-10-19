class CandyBar extends GameObject {
    constructor(options = {}) {
        super({
            name: 'Candy Bar',
            description: 'A chocolate candy bar. Restores 2 points of health.',
            size: [0.2, 0.035, 0.07],
            collectible: true,
            collisionRadius: 0,
            ...options,
        });
    }

    build() {
        const [width, height, depth] = this.size;
        const wrapper = this.track(new THREE.MeshStandardMaterial({ map: this.track(new THREE.CanvasTexture(this.paintWrapper())), roughness: 0.35, metalness: 0.3 }));
        const edge = this.track(new THREE.MeshStandardMaterial({ color: 0x7a1414, roughness: 0.4, metalness: 0.3 }));
        const body = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), [edge, edge, wrapper, edge, edge, edge]);
        this.group.add(body);
        [-1, 1].forEach(side => {
            const crimp = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.018, height * 0.4, depth * 0.95)), edge);
            crimp.position.x = side * (width / 2 + 0.009);
            this.group.add(crimp);
        });
    }

    get solid() {
        return false;
    }

    paintWrapper() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 96;
        this.drawWrapper(canvas.getContext('2d'), 0, 0, 256, 96);
        return canvas;
    }

    drawWrapper(c, x, y, width, height) {
        c.fillStyle = '#9e1a1a';
        c.fillRect(x, y, width, height);
        c.fillStyle = '#5a2a14';
        c.fillRect(x, y + height * 0.72, width, height * 0.28);
        c.fillStyle = '#e8c040';
        c.fillRect(x + width * 0.08, y + height * 0.18, width * 0.84, height * 0.42);
        c.fillStyle = '#7a1010';
        c.font = `bold ${Math.round(height * 0.32)}px Arial Black, Arial, sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('CHOCO', x + width / 2, y + height * 0.4);
    }

    paintIcon(c, x, y, size) {
        c.save();
        c.translate(x + size / 2, y + size / 2);
        c.rotate(-0.5);
        const width = size * 0.82, height = size * 0.3;
        c.shadowColor = 'rgba(0, 0, 0, 0.6)';
        c.shadowBlur = 4;
        this.drawWrapper(c, -width / 2, -height / 2, width, height);
        c.restore();
    }
}
