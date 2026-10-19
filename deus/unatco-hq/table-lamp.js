class TableLamp extends Furniture {
    constructor({ lightColor = 0xffd9a0, lightIntensity = 0.9, lightRange = 6, ...options } = {}) {
        super({ name: 'Lamp', size: [0.34, 0.55, 0.34], collisionRadius: 0, ...options });
        this.light = new THREE.PointLight(lightColor, lightIntensity, lightRange);
        this.light.position.set(0, 0.38, 0);
        this.group.add(this.light);
    }

    get solid() {
        return false;
    }

    build() {
        const brass = this.track(new THREE.MeshStandardMaterial({ color: 0x9a7a44, roughness: 0.3, metalness: 0.85 }));
        const shade = this.track(new THREE.MeshStandardMaterial({
            color: 0xf2dfb8, emissive: 0xffc878, emissiveIntensity: 0.6, roughness: 0.8, side: THREE.DoubleSide,
        }));
        const bulb = this.track(new THREE.MeshBasicMaterial({ color: 0xfff1d0 }));
        this.part(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 20), brass, 0, 0.015, 0);
        this.part(new THREE.SphereGeometry(0.065, 16, 12), brass, 0, 0.09, 0).scale.y = 0.8;
        this.part(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), brass, 0, 0.26, 0);
        this.part(new THREE.SphereGeometry(0.035, 12, 10), bulb, 0, 0.38, 0);
        this.part(new THREE.CylinderGeometry(0.1, 0.17, 0.2, 24, 1, true), shade, 0, 0.42, 0);
    }
}
