class LightningBolt {
    constructor({
        segments = 16,
        coreWidth = 0.025,
        glowWidth = 0.14,
        coreColor = 0xffffff,
        glowColor = 0x6fb6ff,
        jitter = 0.22,
        minInterval = 0.04,
        maxInterval = 0.16,
        dropout = 0.25,
    } = {}) {
        this.segments = segments;
        this.coreWidth = coreWidth;
        this.glowWidth = glowWidth;
        this.jitter = jitter;
        this.minInterval = minInterval;
        this.maxInterval = maxInterval;
        this.dropout = dropout;
        this.points = Array.from({ length: segments + 1 }, () => new THREE.Vector3());
        this.timer = 0;
        this.flicker = 0;
        this.group = new THREE.Group();
        this.core = this.createRibbon(coreColor);
        this.glow = this.createRibbon(glowColor);
        this.group.add(this.glow, this.core);
    }

    createRibbon(color) {
        const vertexCount = (this.segments + 1) * 2;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
        const indices = [];
        for (let index = 0; index < this.segments; index++) {
            const a = index * 2, b = a + 1, c = a + 2, d = a + 3;
            indices.push(a, b, c, b, d, c);
        }
        geometry.setIndex(indices);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        return mesh;
    }

    update(dt, intensity, pickEnds) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);
            this.flicker = Math.random() < this.dropout ? 0 : 0.6 + Math.random() * 0.4;
            const [from, to] = pickEnds();
            this.strike(from, to);
        }
        this.core.material.opacity = intensity * this.flicker;
        this.glow.material.opacity = intensity * this.flicker * 0.45;
    }

    strike(from, to) {
        const offset = new THREE.Vector3();
        const span = from.distanceTo(to);
        this.points.forEach((point, index) => {
            const t = index / this.segments;
            offset.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(this.jitter * span * Math.sin(Math.PI * t));
            point.lerpVectors(from, to, t).add(offset);
        });
        this.writeRibbon(this.core, this.coreWidth);
        this.writeRibbon(this.glow, this.glowWidth);
    }

    writeRibbon(mesh, width) {
        const positions = mesh.geometry.attributes.position;
        const last = this.segments;
        this.points.forEach((point, index) => {
            const previous = this.points[Math.max(0, index - 1)];
            const next = this.points[Math.min(last, index + 1)];
            const dx = next.x - previous.x, dy = next.y - previous.y;
            const length = Math.hypot(dx, dy) || 1;
            const taper = 0.35 + 0.65 * Math.sin(Math.PI * index / last);
            const nx = -dy / length * width * taper / 2, ny = dx / length * width * taper / 2;
            positions.setXYZ(index * 2, point.x + nx, point.y + ny, point.z);
            positions.setXYZ(index * 2 + 1, point.x - nx, point.y - ny, point.z);
        });
        positions.needsUpdate = true;
    }

    dispose() {
        [this.core, this.glow].forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
    }
}
