class MetalDoor {
    constructor({
        position = [0, 0, 0],
        facing = 0,
        size = [1.4, 2.3],
        lampColor = 0xff9a40,
    } = {}) {
        this.size = size;
        this.disposables = [];
        this.group = new THREE.Group();
        this.group.position.set(...position);
        this.group.rotation.y = facing;
        this.build(lampColor);
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    box(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    paint() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const c = canvas.getContext('2d');
        const gradient = c.createLinearGradient(0, 0, 128, 0);
        gradient.addColorStop(0, '#4a5058');
        gradient.addColorStop(0.5, '#6a727c');
        gradient.addColorStop(1, '#4a5058');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 128, 256);
        c.strokeStyle = 'rgba(20, 24, 28, 0.8)';
        c.lineWidth = 3;
        c.strokeRect(10, 10, 108, 110);
        c.strokeRect(10, 136, 108, 110);
        c.fillStyle = 'rgba(20, 24, 28, 0.5)';
        for (let y = 24; y < 110; y += 14) c.fillRect(16, y, 96, 3);
        c.fillStyle = '#2a2e33';
        [[6, 6], [122, 6], [6, 250], [122, 250], [6, 128], [122, 128]].forEach(([x, y]) => {
            c.beginPath();
            c.arc(x, y, 2.5, 0, Math.PI * 2);
            c.fill();
        });
        c.fillStyle = '#c8a020';
        c.fillRect(10, 230, 108, 10);
        c.fillStyle = '#1a1a1a';
        for (let x = 10; x < 118; x += 16) {
            c.beginPath();
            c.moveTo(x, 240);
            c.lineTo(x + 8, 230);
            c.lineTo(x + 14, 230);
            c.lineTo(x + 6, 240);
            c.fill();
        }
        return canvas;
    }

    build(lampColor) {
        const [width, height] = this.size;
        const metal = this.track(new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.4, metalness: 0.8 }));
        const door = this.track(new THREE.MeshStandardMaterial({ map: this.track(new THREE.CanvasTexture(this.paint())), roughness: 0.45, metalness: 0.7 }));
        const panel = this.box(width, height, 0.08, 0, height / 2, 0.04, metal);
        panel.material = [metal, metal, metal, metal, door, metal];
        [-1, 1].forEach(side => this.box(0.12, height + 0.15, 0.14, side * (width / 2 + 0.06), (height + 0.15) / 2, 0.07, metal));
        this.box(width + 0.24, 0.12, 0.14, 0, height + 0.09, 0.07, metal);
        this.box(0.18, 0.04, 0.06, -(width / 2 - 0.2), 1.05, 0.11, metal);
        this.box(0.4, 0.1, 0.2, 0, height + 0.5, 0.1, this.track(new THREE.MeshBasicMaterial({ color: 0xffb060 })));
        const light = new THREE.PointLight(lampColor, 0.8, 8);
        light.position.set(0, height + 0.5, 1.2);
        this.group.add(light);
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
