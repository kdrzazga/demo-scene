class Crate extends GameObject {
    constructor(options = {}) {
        super({
            name: 'Crate',
            size: [1, 1, 1],
            liftable: true,
            ...options,
        });
    }

    build() {
        const [width, height, depth] = this.size;
        const texture = this.track(new THREE.CanvasTexture(this.paintBoards()));
        const mesh = new THREE.Mesh(
            this.track(new THREE.BoxGeometry(width, height, depth)),
            this.track(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 }))
        );
        this.group.add(mesh);
    }

    paintBoards() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const c = canvas.getContext('2d');
        const boards = 5, boardHeight = 256 / boards;
        for (let index = 0; index < boards; index++) {
            const shade = 120 + Math.random() * 30;
            c.fillStyle = `rgb(${shade}, ${shade * 0.74}, ${shade * 0.45})`;
            c.fillRect(0, index * boardHeight, 256, boardHeight);
            for (let grain = 0; grain < 25; grain++) {
                c.fillStyle = `rgba(60, 35, 15, ${Math.random() * 0.25})`;
                c.fillRect(0, index * boardHeight + Math.random() * boardHeight, 256, 1);
            }
            c.fillStyle = 'rgba(30, 18, 8, 0.8)';
            c.fillRect(0, index * boardHeight, 256, 2);
        }
        c.fillStyle = '#6e4e2a';
        c.fillRect(0, 0, 256, 22);
        c.fillRect(0, 234, 256, 22);
        c.fillRect(0, 0, 22, 256);
        c.fillRect(234, 0, 22, 256);
        c.save();
        c.translate(128, 128);
        c.rotate(Math.PI / 4);
        c.fillRect(-170, -11, 340, 22);
        c.restore();
        c.strokeStyle = 'rgba(30, 18, 8, 0.7)';
        c.lineWidth = 2;
        c.strokeRect(1, 1, 254, 254);
        c.strokeRect(22, 22, 212, 212);
        c.fillStyle = '#2a2a2a';
        [[11, 11], [245, 11], [11, 245], [245, 245], [128, 128], [11, 128], [245, 128], [128, 11], [128, 245]].forEach(([x, y]) => {
            c.beginPath();
            c.arc(x, y, 2.5, 0, Math.PI * 2);
            c.fill();
        });
        return canvas;
    }
}
