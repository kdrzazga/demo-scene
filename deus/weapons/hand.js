class Hand {
    constructor({
        skinColor = 0x9a6e50,
        sleeveColor = 0x1a1c22,
        cuffColor = 0x2a2d35,
        gripAngle = -0.25,
    } = {}) {
        this.gripAngle = gripAngle;
        this.disposables = [];
        this.group = new THREE.Group();
        this.skin = this.track(new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 }));
        this.sleeve = this.track(new THREE.MeshStandardMaterial({ color: sleeveColor, roughness: 0.6, metalness: 0.1 }));
        this.cuff = this.track(new THREE.MeshStandardMaterial({ color: cuffColor, roughness: 0.5, metalness: 0.2 }));
        this.grip = new THREE.Group();
        this.grip.position.set(0, -0.045, 0.005);
        this.grip.rotation.x = gripAngle;
        this.group.add(this.grip);
        this.createPalm();
        this.createFingers();
        this.createThumb();
        this.createForearm();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    add(parent, geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(this.track(geometry), material);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    segment(parent, from, to, radius, material) {
        const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
        const mesh = this.add(parent, new THREE.CylinderGeometry(radius, radius * 0.92, start.distanceTo(end), 10), material, 0, 0, 0);
        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
        this.add(parent, new THREE.SphereGeometry(radius, 10, 8), material, ...to);
        return mesh;
    }

    createPalm() {
        const palm = this.add(this.grip, new THREE.BoxGeometry(0.03, 0.09, 0.06), this.skin, 0.026, -0.002, 0.018);
        palm.rotation.y = 0.15;
        this.add(this.grip, new THREE.SphereGeometry(0.026, 12, 10), this.skin, 0.012, -0.02, 0.038).scale.set(1, 1.6, 1);
    }

    createFingers() {
        this.segment(this.grip, [0.026, 0.04, -0.005], [0.014, 0.045, -0.032], 0.0088, this.skin);
        this.segment(this.grip, [0.014, 0.045, -0.032], [0.002, 0.043, -0.05], 0.008, this.skin);
        [0.012, -0.012, -0.036].forEach((height, index) => {
            const radius = index === 2 ? 0.0075 : 0.0088;
            this.add(this.grip, new THREE.SphereGeometry(radius * 1.1, 10, 8), this.skin, 0.03, height, -0.012);
            this.segment(this.grip, [0.03, height, -0.012], [0.006, height, -0.03], radius, this.skin);
            this.segment(this.grip, [0.006, height, -0.03], [-0.018, height - 0.002, -0.022], radius * 0.9, this.skin);
        });
    }

    createThumb() {
        this.segment(this.grip, [-0.004, 0.03, 0.026], [-0.022, 0.045, -0.004], 0.011, this.skin);
        this.segment(this.grip, [-0.022, 0.045, -0.004], [-0.024, 0.05, -0.034], 0.0095, this.skin);
    }

    createForearm() {
        this.segment(this.group, [0.018, -0.07, 0.05], [0.07, -0.16, 0.34], 0.034, this.sleeve);
        this.segment(this.group, [0.016, -0.066, 0.045], [0.024, -0.08, 0.08], 0.032, this.skin);
        this.segment(this.group, [0.022, -0.078, 0.075], [0.03, -0.092, 0.11], 0.038, this.cuff);
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
