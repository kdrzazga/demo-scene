class SecurityTerminal extends GameObject {
    constructor(options = {}) {
        super({
            name: 'Security Computer Terminal',
            size: [0.95, 0.8, 0.36],
            ...options,
        });
    }

    build() {
        const casing = this.track(new THREE.MeshStandardMaterial({ color: 0x2c2e33, roughness: 0.55, metalness: 0.5 }));
        const trim = this.track(new THREE.MeshStandardMaterial({ color: 0x1a1b1f, roughness: 0.6, metalness: 0.4 }));
        const keys = this.track(new THREE.MeshStandardMaterial({ color: 0x55585e, roughness: 0.5, metalness: 0.4 }));
        const red = this.track(new THREE.MeshBasicMaterial({ color: 0xd8202a }));
        this.box(0.95, 0.8, 0.04, 0, 0, 0.02, trim);
        this.box(0.9, 0.5, 0.12, 0, 0.13, 0.1, casing);
        this.box(0.76, 0.4, 0.02, 0, 0.14, 0.16, trim);
        const screen = new THREE.Mesh(
            this.track(new THREE.PlaneGeometry(0.7, 0.35)),
            this.track(new THREE.MeshBasicMaterial({ map: this.track(new THREE.CanvasTexture(this.paintScreen())) }))
        );
        screen.position.set(0, 0.14, 0.172);
        this.group.add(screen);
        [-1, 1].forEach(side => {
            this.box(0.05, 0.03, 0.02, side * 0.4, 0.35, 0.165, red);
            this.box(0.05, 0.3, 0.3, side * 0.43, -0.2, 0.17, casing);
        });
        const keyboard = new THREE.Group();
        keyboard.position.set(0, -0.2, 0.2);
        keyboard.rotation.x = -0.4;
        this.group.add(keyboard);
        this.box(0.82, 0.06, 0.32, 0, 0, 0, casing, keyboard);
        this.box(0.1, 0.012, 0.032, -0.26, 0.036, 0, red, keyboard);
        this.box(0.032, 0.012, 0.1, -0.26, 0.036, 0, red, keyboard);
        this.box(0.03, 0.016, 0.03, -0.26, 0.04, 0, trim, keyboard);
        for (let row = 0; row < 3; row++) {
            for (let column = 0; column < 4; column++) {
                this.box(0.04, 0.012, 0.035, 0.08 + column * 0.055, 0.036, -0.06 + row * 0.05, keys, keyboard);
            }
        }
        this.box(0.14, 0.01, 0.03, -0.02, 0.034, 0.1, trim, keyboard);
        this.screenLight = new THREE.PointLight(0x3050ff, 0.5, 3);
        this.screenLight.position.set(0, 0.15, 0.6);
        this.group.add(this.screenLight);
    }

    box(width, height, depth, x, y, z, material, parent = this.group) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    paintScreen() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const c = canvas.getContext('2d');
        const gradient = c.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, '#0c1c78');
        gradient.addColorStop(1, '#16289e');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 256, 128);
        for (let y = 0; y < 128; y += 3) {
            c.fillStyle = 'rgba(0, 0, 0, 0.12)';
            c.fillRect(0, y, 256, 1);
        }
        c.strokeStyle = '#5a7af0';
        c.lineWidth = 2;
        c.strokeRect(150, 36, 84, 46);
        c.fillStyle = '#2a44c0';
        c.fillRect(151, 37, 82, 10);
        c.fillStyle = '#9fb4ff';
        c.fillRect(158, 54, 66, 6);
        c.fillRect(158, 66, 66, 6);
        return canvas;
    }
}
