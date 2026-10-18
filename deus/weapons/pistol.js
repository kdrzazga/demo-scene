class Pistol {
    constructor({
        slideColor = 0x1c1e22,
        frameColor = 0x141518,
        detailColor = 0x5a5e66,
        gripAngle = -0.25,
        slideTravel = 0.03,
    } = {}) {
        this.gripAngle = gripAngle;
        this.slideTravel = slideTravel;
        this.disposables = [];
        this.group = new THREE.Group();
        this.slideMaterial = this.track(new THREE.MeshStandardMaterial({ color: slideColor, roughness: 0.35, metalness: 0.75 }));
        this.frameMaterial = this.track(new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.55, metalness: 0.5 }));
        this.detailMaterial = this.track(new THREE.MeshStandardMaterial({ color: detailColor, roughness: 0.3, metalness: 0.85 }));
        this.createSlide();
        this.createFrame();
        this.createGrip();
        this.muzzle = new THREE.Object3D();
        this.muzzle.position.set(0, 0.028, -0.205);
        this.group.add(this.muzzle);
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

    createSlide() {
        this.slide = new THREE.Group();
        this.group.add(this.slide);
        this.add(this.slide, new THREE.BoxGeometry(0.032, 0.036, 0.19), this.slideMaterial, 0, 0.03, -0.095);
        this.add(this.slide, new THREE.BoxGeometry(0.006, 0.008, 0.01), this.slideMaterial, 0, 0.052, -0.18);
        this.add(this.slide, new THREE.BoxGeometry(0.024, 0.008, 0.01), this.slideMaterial, 0, 0.052, -0.012);
        this.add(this.slide, new THREE.BoxGeometry(0.002, 0.014, 0.04), this.detailMaterial, 0.0165, 0.034, -0.06);
        for (let index = 0; index < 6; index++) {
            this.add(this.slide, new THREE.BoxGeometry(0.034, 0.03, 0.003), this.frameMaterial, 0, 0.03, -0.01 - index * 0.007);
        }
        const barrel = this.add(this.slide, new THREE.CylinderGeometry(0.008, 0.008, 0.016, 12), this.frameMaterial, 0, 0.028, -0.195);
        barrel.rotation.x = Math.PI / 2;
    }

    createFrame() {
        this.add(this.group, new THREE.BoxGeometry(0.03, 0.022, 0.15), this.frameMaterial, 0, 0.002, -0.07);
        const guard = this.add(this.group, new THREE.TorusGeometry(0.018, 0.003, 6, 16, Math.PI), this.frameMaterial, 0, -0.008, -0.06);
        guard.rotation.set(0, Math.PI / 2, Math.PI);
        const trigger = this.add(this.group, new THREE.BoxGeometry(0.006, 0.018, 0.006), this.detailMaterial, 0, -0.014, -0.055);
        trigger.rotation.x = 0.3;
    }

    createGrip() {
        const grip = this.add(this.group, new THREE.BoxGeometry(0.03, 0.1, 0.045), this.frameMaterial, 0, -0.045, 0.005);
        grip.rotation.x = this.gripAngle;
        [-1, 1].forEach(side => {
            const panel = this.add(this.group, new THREE.BoxGeometry(0.003, 0.075, 0.034), this.slideMaterial, side * 0.0155, -0.048, 0.006);
            panel.rotation.x = this.gripAngle;
        });
        this.add(this.group, new THREE.BoxGeometry(0.032, 0.008, 0.048), this.detailMaterial, 0, -0.096, 0.018).rotation.x = this.gripAngle;
    }

    recoil(amount) {
        this.slide.position.z = amount * this.slideTravel;
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
