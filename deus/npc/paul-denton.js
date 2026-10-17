class PaulDenton extends NPC {
    constructor(options = {}) {
        super({
            name: 'Paul Denton',
            welcomeMp3: 'npc/Paul! I thought you were in Hong Kong.mp3',
            ...options,
            appearance: {
                skin: 0xb07e5e,
                hair: 0x0e0d0c,
                eyes: 0x7fc4ff,
                shirt: 0x2c4440,
                sleeve: 0x1b1e2a,
                pants: 0x121318,
                shoes: 0x08080a,
                coat: 0x1b1e2a,
                coatTrim: 0xc9ccd4,
                clasp: 0xa8adb5,
                ...options.appearance,
            },
        });
    }

    decorate() {
        this.paintShirt();
        this.createCoat();
        this.createCollar();
        this.createClasps();
        this.createSleeveBands();
        this.createFacialHair();
    }

    eyeMaterial() {
        return this.basicMaterial(this.appearance.eyes);
    }

    basicMaterial(color) {
        const key = `basic:${color}`;
        if (!this.materials.has(key)) this.materials.set(key, this.track(new THREE.MeshBasicMaterial({ color })));
        return this.materials.get(key);
    }

    cssColor(color) {
        return `#${new THREE.Color(color).getHexString()}`;
    }

    paintShirt() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const c = canvas.getContext('2d');
        c.fillStyle = this.cssColor(this.appearance.shirt);
        c.fillRect(0, 0, 128, 128);
        for (let y = 0; y < 128; y += 8) {
            c.fillStyle = 'rgba(0, 0, 0, 0.25)';
            c.fillRect(0, y, 128, 2);
            c.fillStyle = 'rgba(255, 255, 255, 0.05)';
            c.fillRect(0, y + 3, 128, 2);
        }
        c.fillStyle = '#b8bec4';
        c.fillRect(62, 0, 4, 128);
        const texture = this.track(new THREE.CanvasTexture(canvas));
        texture.wrapS = THREE.RepeatWrapping;
        texture.offset.x = 0.5;
        const chest = this.torso.children[0];
        chest.material = this.track(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 }));
    }

    paintCoat() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const c = canvas.getContext('2d');
        const gradient = c.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, this.cssColor(this.appearance.coat));
        gradient.addColorStop(0.86, this.cssColor(this.appearance.coat));
        gradient.addColorStop(0.9, this.cssColor(this.appearance.coatTrim));
        gradient.addColorStop(1, '#ffffff');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 128, 256);
        for (let fold = 0; fold < 30; fold++) {
            c.fillStyle = `rgba(${Math.random() < 0.5 ? '0, 0, 0' : '120, 130, 160'}, ${0.05 + Math.random() * 0.08})`;
            c.fillRect(Math.random() * 128, 0, 1 + Math.random() * 4, 220);
        }
        return this.track(new THREE.CanvasTexture(canvas));
    }

    createCoat() {
        const profile = [[0.31, 0.5], [0.28, 0.75], [0.24, 1.0], [0.22, 1.25], [0.235, 1.46], [0.21, 1.55], [0.13, 1.6]]
            .map(([radius, height]) => new THREE.Vector2(radius, height));
        const gap = 0.5;
        const coat = this.add(this.body, new THREE.LatheGeometry(profile, 32, gap, Math.PI * 2 - gap * 2),
            this.track(new THREE.MeshStandardMaterial({ map: this.paintCoat(), roughness: 0.55, metalness: 0.15, side: THREE.DoubleSide })));
        coat.scale.z = 0.72;
        this.coat = coat;
        const coatMaterial = this.material(this.appearance.coat, { roughness: 0.55, metalness: 0.15 });
        [-1, 1].forEach(side => {
            const pad = this.add(this.body, new THREE.SphereGeometry(0.11, 14, 10), coatMaterial, side * 0.2, 1.5, 0);
            pad.scale.set(1.2, 0.6, 0.95);
        });
    }

    createCollar() {
        const coatMaterial = this.track(new THREE.MeshStandardMaterial({ color: this.appearance.coat, roughness: 0.55, metalness: 0.15, side: THREE.DoubleSide }));
        const collar = this.add(this.body, new THREE.CylinderGeometry(0.1, 0.13, 0.16, 20, 1, true, 0.55, Math.PI * 2 - 1.1), coatMaterial, 0, 1.66, -0.005);
        collar.scale.z = 0.95;
        [-1, 1].forEach(side => {
            const lapel = this.add(this.body, new THREE.BoxGeometry(0.06, 0.34, 0.015), coatMaterial, side * 0.09, 1.42, 0.14);
            lapel.rotation.set(-0.12, side * 0.35, side * 0.18);
        });
    }

    createClasps() {
        const clasp = this.material(this.appearance.clasp, { metalness: 0.9, roughness: 0.3 });
        [1.45, 1.33, 1.21, 1.09].forEach(height => [-1, 1].forEach(side => {
            this.add(this.body, new THREE.BoxGeometry(0.035, 0.012, 0.012), clasp, side * 0.105, height, 0.15);
        }));
    }

    createSleeveBands() {
        const trim = this.material(this.appearance.coatTrim, { roughness: 0.5 });
        this.arms.forEach((arm, index) => {
            const side = index === 0 ? -1 : 1;
            this.limb(arm, [side * 0.033, -0.4, 0.02], [side * 0.036, -0.45, 0.025], 0.06, 0.058, trim);
            this.limb(arm, [side * 0.012, -0.08, 0.004], [side * 0.016, -0.11, 0.005], 0.068, 0.067, trim);
        });
    }

    createFacialHair() {
        const hair = this.material(this.appearance.hair, { roughness: 0.9 });
        this.add(this.head, new THREE.BoxGeometry(0.065, 0.012, 0.015), hair, 0, 0.042, 0.11);
        [-1, 1].forEach(side => this.add(this.head, new THREE.BoxGeometry(0.01, 0.035, 0.012), hair, side * 0.03, 0.025, 0.108));
        this.add(this.head, new THREE.BoxGeometry(0.035, 0.04, 0.02), hair, 0, -0.005, 0.085);
    }
}
