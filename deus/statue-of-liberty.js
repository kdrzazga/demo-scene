class StatueOfLiberty {
    constructor({
        position = [-45, -2, -110],
        rotation = 0.38,
        scale = 1,
        patinaColor = 0x5d7d6e,
        stoneColor = 0x4c4b47,
        flameColor = 0xffb040,
    } = {}) {
        this.group = new THREE.Group();
        this.group.position.set(...position);
        this.group.rotation.y = rotation;
        this.group.scale.setScalar(scale);
        this.disposables = [];
        this.time = 0;
        this.patina = this.track(new THREE.MeshStandardMaterial({ color: patinaColor, roughness: 0.75, metalness: 0.25 }));
        this.stone = this.track(new THREE.MeshStandardMaterial({ color: stoneColor, roughness: 0.95 }));
        this.flameColor = flameColor;
        this.statueBase = 25.5;
        this.createPedestal();
        this.createFigure();
        this.createTorch();
        this.createUplights();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    add(geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(this.track(geometry), material);
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    createPedestal() {
        this.add(new THREE.CylinderGeometry(34, 36, 3, 24), this.stone, 0, 1.5, 0);
        this.add(new THREE.CylinderGeometry(18, 19, 4, 11), this.stone, 0, 5, 0);
        this.add(new THREE.CylinderGeometry(6.4, 8.5, 16, 4), this.stone, 0, 15, 0).rotation.y = Math.PI / 4;
        this.add(new THREE.BoxGeometry(10, 1.5, 10), this.stone, 0, 23.75, 0);
        this.add(new THREE.BoxGeometry(6, 1, 6), this.stone, 0, 25, 0);
    }

    createFigure() {
        const base = this.statueBase;
        const robeProfile = [[2.9, 0], [3.0, 1], [2.6, 4], [2.3, 8], [2.2, 11], [2.4, 13.5], [1.9, 15.5], [0.9, 16.3], [0.7, 17]]
            .map(([radius, height]) => new THREE.Vector2(radius, height));
        this.add(new THREE.LatheGeometry(robeProfile, 24), this.patina, 0, base, 0);
        const headY = base + 18.1;
        this.add(new THREE.SphereGeometry(1.25, 20, 16), this.patina, 0, headY, 0.2);
        this.add(new THREE.TorusGeometry(1.25, 0.2, 8, 24), this.patina, 0, headY + 0.6, 0.2).rotation.x = Math.PI / 2;
        for (let index = 0; index < 7; index++) {
            const angle = (-80 + index * 160 / 6) * Math.PI / 180;
            const spike = this.add(new THREE.ConeGeometry(0.18, 2.2, 6), this.patina, Math.sin(angle) * 1.4, headY + 1.3, 0.2 + Math.cos(angle) * 1.4);
            spike.rotation.set(Math.cos(angle) * 0.9, 0, -Math.sin(angle) * 0.9);
        }
        const shoulder = new THREE.Vector3(1.7, base + 15.8, 0);
        const hand = new THREE.Vector3(2.4, base + 22.5, 0);
        const arm = this.add(new THREE.CylinderGeometry(0.45, 0.55, shoulder.distanceTo(hand), 10), this.patina, (shoulder.x + hand.x) / 2, (shoulder.y + hand.y) / 2, 0);
        arm.rotation.z = -Math.atan2(hand.x - shoulder.x, hand.y - shoulder.y);
        this.hand = hand;
        const tablet = this.add(new THREE.BoxGeometry(1.8, 2.8, 0.5), this.patina, -2.2, base + 12.5, 0.9);
        tablet.rotation.set(-0.2, 0, 0.25);
    }

    createTorch() {
        const { x, y } = this.hand;
        this.add(new THREE.CylinderGeometry(0.35, 0.3, 2, 10), this.patina, x, y + 1, 0);
        this.add(new THREE.CylinderGeometry(0.8, 0.4, 0.8, 12), this.patina, x, y + 2.2, 0);
        this.flame = this.add(new THREE.ConeGeometry(0.6, 1.6, 10), this.track(new THREE.MeshBasicMaterial({ color: this.flameColor })), x, y + 3.4, 0);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const c = canvas.getContext('2d');
        const gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 210, 140, 1)');
        gradient.addColorStop(1, 'rgba(255, 140, 40, 0)');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 64, 64);
        this.glow = new THREE.Sprite(this.track(new THREE.SpriteMaterial({
            map: this.track(new THREE.CanvasTexture(canvas)),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        })));
        this.glow.scale.setScalar(6);
        this.glow.position.set(x, y + 3.4, 0);
        this.group.add(this.glow);
        this.flameLight = new THREE.PointLight(this.flameColor, 1.5, 20);
        this.flameLight.position.set(x, y + 3.6, 0.5);
        this.group.add(this.flameLight);
    }

    createUplights() {
        const target = new THREE.Object3D();
        target.position.set(0, this.statueBase + 12, 0);
        this.group.add(target);
        [[-4, 4], [4, 4], [0, -5]].forEach(([x, z]) => {
            const light = new THREE.SpotLight(0xcfe0ff, 1.3, 60, 0.6, 0.6);
            light.position.set(x, 24.5, z);
            light.target = target;
            this.group.add(light);
        });
    }

    update(dt) {
        this.time += dt;
        const flicker = 0.85 + Math.sin(this.time * 17) * 0.08 + Math.sin(this.time * 31) * 0.07;
        this.flameLight.intensity = 1.5 * flicker;
        this.glow.scale.setScalar(6 * flicker);
        this.flame.scale.y = flicker;
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
