class Armchair extends Furniture {
    constructor(options = {}) {
        super({ name: 'Armchair', size: [0.85, 0.95, 0.85], collisionRadius: 0.75, ...options });
    }

    build() {
        const leather = this.track(new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.38, metalness: 0.1 }));
        const seam = this.track(new THREE.MeshStandardMaterial({ color: 0x08090a, roughness: 0.6 }));
        const chrome = this.track(new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.2, metalness: 0.9 }));
        this.part(new THREE.BoxGeometry(0.8, 0.22, 0.75), seam, 0, 0.2, 0);
        this.part(new THREE.BoxGeometry(0.58, 0.14, 0.62), leather, 0, 0.38, 0.04);
        const back = this.part(new THREE.BoxGeometry(0.8, 0.6, 0.18), leather, 0, 0.62, -0.3);
        back.rotation.x = -0.12;
        this.part(new THREE.BoxGeometry(0.54, 0.42, 0.08), seam, 0, 0.64, -0.2).rotation.x = -0.12;
        [-1, 1].forEach(side => {
            this.part(new THREE.BoxGeometry(0.14, 0.34, 0.75), leather, side * 0.33, 0.48, 0);
            const roll = this.part(new THREE.CylinderGeometry(0.075, 0.075, 0.75, 12), leather, side * 0.33, 0.65, 0);
            roll.rotation.x = Math.PI / 2;
            [-1, 1].forEach(end => this.part(new THREE.CylinderGeometry(0.02, 0.025, 0.09, 8), chrome, side * 0.34, 0.045, end * 0.32));
        });
    }
}
