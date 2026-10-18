class StreetLamp {
    constructor({
        position = [0, 0, 0],
        facing = 0,
        poleHeight = 5,
        armLength = 1.2,
        poleColor = 0x30343a,
        lightColor = 0xdde8ff,
        lightIntensity = 1.6,
        lightRange = 30,
        glowSize = 2.4,
        collisionRadius = 0.3,
    } = {}) {
        this.poleHeight = poleHeight;
        this.armLength = armLength;
        this.collisionRadius = collisionRadius;
        this.disposables = [];
        this.group = new THREE.Group();
        this.group.position.set(...position);
        this.group.rotation.y = facing;
        const metal = this.track(new THREE.MeshStandardMaterial({ color: poleColor, roughness: 0.5, metalness: 0.6 }));
        this.box(0.15, poleHeight, 0.15, 0, poleHeight / 2, 0, metal);
        this.box(0.3, 0.2, 0.3, 0, 0.1, 0, metal);
        this.box(0.1, 0.1, armLength, 0, poleHeight, armLength / 2 - 0.05, metal);
        this.box(0.25, 0.12, 0.35, 0, poleHeight - 0.08, armLength - 0.1, metal);
        this.createLight(lightColor, lightIntensity, lightRange, glowSize);
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    box(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    get position() {
        return this.group.position;
    }

    get radius() {
        return this.collisionRadius;
    }

    createLight(color, intensity, range, glowSize) {
        const bulbY = this.poleHeight - 0.18, bulbZ = this.armLength - 0.1;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const c = canvas.getContext('2d');
        const gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(230, 240, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 64, 64);
        const glow = new THREE.Sprite(this.track(new THREE.SpriteMaterial({
            map: this.track(new THREE.CanvasTexture(canvas)),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        })));
        glow.scale.setScalar(glowSize);
        glow.position.set(0, bulbY, bulbZ);
        glow.raycast = () => {};
        this.group.add(glow);
        const light = new THREE.PointLight(color, intensity, range);
        light.position.set(0, bulbY - 0.2, bulbZ);
        this.group.add(light);
    }

    static facingTowards([fromX, fromZ], [toX, toZ]) {
        return Math.atan2(toX - fromX, toZ - fromZ);
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
