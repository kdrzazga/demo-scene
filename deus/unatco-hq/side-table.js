class SideTable extends Furniture {
    constructor({ radius = 0.3, height = 0.62, ...options } = {}) {
        super({ name: 'Table', size: [radius * 2, height, radius * 2], collisionRadius: radius + 0.15, surfaceHeight: height, surfaceRadius: radius, ...options });
    }

    build() {
        const [diameter, height] = this.size;
        const radius = diameter / 2;
        const wood = this.track(new THREE.MeshStandardMaterial({ color: 0x2e2420, roughness: 0.45, metalness: 0.1 }));
        const metal = this.track(new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.35, metalness: 0.7 }));
        this.part(new THREE.CylinderGeometry(radius, radius, 0.04, 28), wood, 0, height - 0.02, 0);
        this.part(new THREE.CylinderGeometry(radius + 0.005, radius + 0.005, 0.012, 28), metal, 0, height - 0.046, 0);
        this.part(new THREE.CylinderGeometry(0.035, 0.045, height - 0.08, 12), metal, 0, (height - 0.08) / 2 + 0.03, 0);
        this.part(new THREE.CylinderGeometry(radius * 0.65, radius * 0.7, 0.03, 24), metal, 0, 0.015, 0);
    }
}
