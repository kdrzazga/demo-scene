class Terrorist extends NPC {
    constructor(options = {}) {
        super({
            name: 'Terrorist',
            hitPoints: 4,
            ...options,
            appearance: {
                skin: 0x55504c,
                eyes: 0x0c0c0e,
                shirt: 0x1e1f22,
                sleeve: 0x7a5e38,
                pants: 0x9c8660,
                shoes: 0x2e3033,
                belt: 0x9a9ea4,
                buckle: 0xc8ccd2,
                helmet: 0x3a3d42,
                chrome: 0xb8bcc2,
                straps: 0x111214,
                panels: 0x2e2e30,
                visor: 0xff8c1a,
                ...options.appearance,
            },
        });
    }

    decorate() {
        this.chrome = this.material(this.appearance.chrome, { metalness: 0.85, roughness: 0.25 });
        this.straps = this.material(this.appearance.straps, { roughness: 0.6 });
        this.createChestPlate();
        this.createStraps();
        this.createLegPanels();
        this.createBoots();
        this.createVisor();
    }

    basicMaterial(color) {
        const key = `basic:${color}`;
        if (!this.materials.has(key)) this.materials.set(key, this.track(new THREE.MeshBasicMaterial({ color })));
        return this.materials.get(key);
    }

    createHair() {
        const helmet = this.material(this.appearance.helmet, { metalness: 0.7, roughness: 0.35 });
        this.add(this.head, new THREE.SphereGeometry(0.132, 24, 18), helmet, 0, 0.09, 0.004).scale.set(0.95, 1.12, 1.08);
        this.add(this.head, new THREE.BoxGeometry(0.03, 0.02, 0.24), helmet, 0, 0.235, -0.01);
        this.add(this.head, new THREE.CylinderGeometry(0.09, 0.11, 0.06, 16), helmet, 0, -0.04, 0);
    }

    createVisor() {
        const frame = this.material(this.appearance.straps, { metalness: 0.5, roughness: 0.4 });
        this.add(this.head, new THREE.BoxGeometry(0.15, 0.045, 0.02), frame, 0, 0.115, 0.148);
        this.add(this.head, new THREE.BoxGeometry(0.13, 0.026, 0.01), this.basicMaterial(this.appearance.visor), 0, 0.115, 0.159);
        this.add(this.head, new THREE.BoxGeometry(0.05, 0.035, 0.02), frame, 0, 0.03, 0.14);
    }

    createChestPlate() {
        const plate = this.add(this.torso, new THREE.CylinderGeometry(0.215, 0.19, 0.48, 20), this.chrome, 0, 0.28, 0);
        plate.scale.z = 0.74;
        this.add(this.torso, new THREE.CylinderGeometry(0.075, 0.09, 0.07, 14), this.material(this.appearance.shirt), 0, 0.54, 0);
        [-1, 1].forEach(side => {
            const shoulder = this.add(this.body, new THREE.SphereGeometry(0.1, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.chrome, side * 0.22, 1.5, 0);
            shoulder.scale.set(1.15, 0.75, 1.0);
            shoulder.rotation.z = side * -0.35;
        });
    }

    createStraps() {
        [0.43, 0.33, 0.2, 0.08].forEach(height => this.add(this.torso, new THREE.BoxGeometry(0.07, 0.022, 0.02), this.straps, 0, height, 0.162));
        this.add(this.torso, new THREE.BoxGeometry(0.012, 0.4, 0.012), this.straps, 0, 0.26, 0.158);
        [-1, 1].forEach(side => {
            const strap = this.add(this.torso, new THREE.BoxGeometry(0.035, 0.18, 0.02), this.straps, side * 0.12, 0.4, 0.15);
            strap.rotation.set(-0.25, 0, side * 0.6);
            [0, 1, 2].forEach(index => {
                const buckle = this.add(this.torso, new THREE.BoxGeometry(0.06, 0.014, 0.02), this.straps, side * (0.09 + index * 0.03), 0.43 - index * 0.025, 0.152);
                buckle.rotation.z = side * 0.6;
            });
        });
    }

    createLegPanels() {
        const panels = this.material(this.appearance.panels, { roughness: 0.7 });
        this.legs.forEach((leg, index) => {
            const side = index === 0 ? -1 : 1;
            this.add(leg, new THREE.BoxGeometry(0.02, 0.5, 0.08), panels, side * 0.085, -0.3, 0);
            this.limb(leg, [0, -0.5, 0.005], [0, -0.53, 0.006], 0.084, 0.083, panels);
            this.limb(leg, [0, -0.6, 0.007], [0, -0.62, 0.007], 0.08, 0.08, panels);
        });
    }

    createBoots() {
        const boots = this.material(this.appearance.shoes, { metalness: 0.6, roughness: 0.35 });
        this.legs.forEach(leg => this.limb(leg, [0, -0.62, 0.008], [0, -0.89, 0.012], 0.083, 0.086, boots));
    }
}
