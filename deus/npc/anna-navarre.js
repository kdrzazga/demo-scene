class AnnaNavarre extends NPC {
    constructor(options = {}) {
        super({
            name: 'Anna Navarre',
            hitPoints: 5,
            height: 1.8,
            welcomeMp3: 'npc/AnnaNavarre.mp3',
            ...options,
            appearance: {
                skin: 0xe4dcd8,
                hair: 0x0c0c0e,
                eyes: 0x2a2a2e,
                shirt: 0x2a2c30,
                sleeve: 0x9fb3c8,
                pants: 0x3a4250,
                shoes: 0x16181c,
                belt: 0x1a1b1e,
                buckle: 0x6a6e74,
                suit: 0x2a2c30,
                plates: 0x3a3c41,
                studs: 0xb8bcc2,
                implant: 0x7f97b4,
                implantEye: 0xff2a3a,
                lips: 0xa82a36,
                ...options.appearance,
            },
        });
    }

    decorate() {
        this.body.scale.set(0.9, 1, 0.92);
        this.suit = this.material(this.appearance.suit, { roughness: 0.4, metalness: 0.2 });
        this.metal = this.material(this.appearance.studs, { roughness: 0.3, metalness: 0.85 });
        this.torso.children[0].material = this.suit;
        this.createChest();
        this.createCollar();
        this.createCyberArms();
        this.createFace();
    }

    basicMaterial(color) {
        const key = `basic:${color}`;
        if (!this.materials.has(key)) this.materials.set(key, this.track(new THREE.MeshBasicMaterial({ color })));
        return this.materials.get(key);
    }

    createChest() {
        const plates = this.material(this.appearance.plates, { roughness: 0.35, metalness: 0.25 });
        [-1, 1].forEach(side => this.add(this.torso, new THREE.SphereGeometry(0.075, 16, 12), plates, side * 0.07, 0.34, 0.095).scale.set(1, 0.85, 0.75));
        for (let index = 0; index < 9; index++) {
            const x = -0.12 + index * 0.03;
            this.add(this.torso, new THREE.SphereGeometry(0.007, 6, 6), this.metal, x, 0.47, 0.134 * Math.sqrt(1 - (x / 0.197) ** 2));
        }
        this.add(this.torso, new THREE.BoxGeometry(0.014, 0.48, 0.012), this.metal, 0, 0.32, 0.138);
        [0.2, 0.14, 0.08, 0.02].forEach(height => this.add(this.torso, new THREE.BoxGeometry(0.2, 0.018, 0.02), plates, 0, height, 0.126));
    }

    createCollar() {
        this.add(this.torso, new THREE.CylinderGeometry(0.068, 0.08, 0.11, 16), this.suit, 0, 0.6, 0);
    }

    paintPerforation() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const c = canvas.getContext('2d');
        c.fillStyle = '#c4ccd4';
        c.fillRect(0, 0, 64, 64);
        c.fillStyle = '#121418';
        for (let y = 4; y < 64; y += 10) {
            for (let x = (y / 10) % 2 === 0 ? 4 : 9; x < 64; x += 10) {
                c.beginPath();
                c.ellipse(x, y, 2.5, 3.5, 0, 0, Math.PI * 2);
                c.fill();
            }
        }
        const texture = this.track(new THREE.CanvasTexture(canvas));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    createCyberArms() {
        const forearm = this.track(new THREE.MeshStandardMaterial({ map: this.paintPerforation(), roughness: 0.35, metalness: 0.6 }));
        const upper = this.material(this.appearance.implant, { roughness: 0.3, metalness: 0.6 });
        this.arms.forEach((arm, index) => {
            const side = index === 0 ? -1 : 1;
            this.limb(arm, [side * 0.03, -0.31, 0.01], [side * 0.04, -0.55, 0.04], 0.061, 0.052, forearm);
            this.limb(arm, [0, -0.04, 0], [side * 0.028, -0.28, 0.01], 0.067, 0.06, upper);
        });
    }

    createFace() {
        this.add(this.head, new THREE.BoxGeometry(0.04, 0.012, 0.012), this.material(this.appearance.lips, { roughness: 0.4 }), 0, 0.035, 0.11);
        const implant = this.add(this.head, new THREE.CircleGeometry(0.03, 20), this.material(this.appearance.implant, { roughness: 0.3, metalness: 0.7 }), 0.042, 0.11, 0.103);
        implant.rotation.y = 0.35;
        this.add(this.head, new THREE.SphereGeometry(0.015, 12, 10), this.basicMaterial(this.appearance.implantEye), 0.038, 0.11, 0.108);
    }
}
