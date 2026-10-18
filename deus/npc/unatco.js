class UnatcoTroop extends NPC {
    constructor(options = {}) {
        super({
            name: 'UNATCO Troop',
            hitPoints: 5,
            ...options,
            appearance: {
                skin: 0xc49a7c,
                eyes: 0x0c0c0e,
                shirt: 0x18191d,
                sleeve: 0x1c1d22,
                pants: 0x141418,
                shoes: 0x09090a,
                armor: 0x56613a,
                armorDark: 0x353d22,
                mask: 0x8a8f94,
                lights: 0xff8a2a,
                emblemOuter: 0x2a5cc8,
                emblemInner: 0xc8282a,
                ...options.appearance,
            },
        });
    }

    decorate() {
        this.armor = this.material(this.appearance.armor, { roughness: 0.5, metalness: 0.2 });
        this.armorDark = this.material(this.appearance.armorDark, { roughness: 0.6, metalness: 0.2 });
        this.createVest();
        this.createChestLights();
        this.createThighPlates();
        this.createBoots();
        this.createMask();
        this.createEmblem();
    }

    basicMaterial(color) {
        const key = `basic:${color}`;
        if (!this.materials.has(key)) this.materials.set(key, this.track(new THREE.MeshBasicMaterial({ color })));
        return this.materials.get(key);
    }

    createHair() {
        const armor = this.material(this.appearance.armor, { roughness: 0.45, metalness: 0.25 });
        const helmet = this.add(this.head, new THREE.SphereGeometry(0.135, 24, 14, 0, Math.PI * 2, 0, 1.45), armor, 0, 0.11, -0.005);
        helmet.scale.set(0.95, 1.08, 1.05);
        helmet.rotation.x = -0.15;
        const rim = this.add(this.head, new THREE.TorusGeometry(0.134, 0.01, 6, 28), armor, 0, 0.127, -0.005);
        rim.rotation.x = Math.PI / 2 - 0.15;
        rim.scale.set(0.95, 1.05, 1);
    }

    createVest() {
        const vest = this.add(this.torso, new THREE.CylinderGeometry(0.225, 0.195, 0.46, 18), this.armor, 0, 0.3, 0);
        vest.scale.z = 0.74;
        [0.18, 0.11, 0.04].forEach(height => {
            const ridge = this.add(this.torso, new THREE.BoxGeometry(0.2, 0.025, 0.02), this.armorDark, 0, height, 0.158);
            ridge.scale.x = 1 - (0.18 - height);
        });
        [-1, 1].forEach(side => {
            const plate = this.add(this.torso, new THREE.BoxGeometry(0.11, 0.16, 0.02), this.armorDark, side * 0.08, 0.38, 0.17);
            plate.rotation.y = side * 0.25;
            const shoulder = this.add(this.body, new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.armor, side * 0.22, 1.5, 0);
            shoulder.scale.set(1.15, 0.8, 1.0);
            shoulder.rotation.z = side * -0.35;
        });
        this.add(this.torso, new THREE.CylinderGeometry(0.075, 0.085, 0.06, 14), this.material(this.appearance.shirt), 0, 0.55, 0);
    }

    createChestLights() {
        const light = this.basicMaterial(this.appearance.lights);
        [-1, 1].forEach(side => this.add(this.torso, new THREE.BoxGeometry(0.025, 0.015, 0.01), light, side * 0.08, 0.29, 0.168));
    }

    createThighPlates() {
        this.legs.forEach(leg => {
            const plate = this.add(leg, new THREE.CylinderGeometry(0.1, 0.092, 0.42, 12, 1, true, -0.9, 1.8),
                this.material(this.appearance.armor, { roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide }), 0, -0.25, 0.004);
            plate.rotation.x = 0.02;
            this.add(leg, new THREE.SphereGeometry(0.05, 10, 8), this.armorDark, 0, -0.47, 0.06).scale.set(1, 1.2, 0.6);
        });
    }

    createBoots() {
        const boots = this.material(this.appearance.shoes, { roughness: 0.35 });
        this.legs.forEach(leg => this.limb(leg, [0, -0.57, 0.008], [0, -0.89, 0.012], 0.082, 0.085, boots));
    }

    createMask() {
        const mask = this.material(this.appearance.mask, { roughness: 0.35, metalness: 0.7 });
        const face = this.add(this.head, new THREE.SphereGeometry(0.126, 20, 10, Math.PI / 2 - 1.2, 2.4, Math.PI / 2 - 0.05, 0.75), mask, 0, 0.085, 0.004);
        face.scale.set(0.92, 1.1, 1.05);
        [-1, 1].forEach(side => {
            const filter = this.add(this.head, new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), mask, side * 0.05, 0.03, 0.12);
            filter.rotation.set(Math.PI / 2, 0, side * 0.5);
        });
        this.add(this.head, new THREE.BoxGeometry(0.03, 0.05, 0.02), this.material(0x2a2c30, { metalness: 0.6 }), 0, 0.02, 0.135);
    }

    createEmblem() {
        const outer = this.add(this.head, new THREE.CircleGeometry(0.032, 20), this.basicMaterial(this.appearance.emblemOuter), 0, 0.19, 0.123);
        outer.rotation.x = -0.45;
        const inner = this.add(this.head, new THREE.CircleGeometry(0.02, 16), this.basicMaterial(this.appearance.emblemInner), 0, 0.1905, 0.1245);
        inner.rotation.x = -0.45;
    }
}
