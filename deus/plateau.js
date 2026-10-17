class Plateau {
    constructor({
        height = 3,
        waterLevel = -2,
        rects = [],
        circles = [],
        material = new THREE.MeshStandardMaterial({ color: 0x5a626c, roughness: 0.95 }),
        parapetHeight = 0.9,
        parapetThickness = 0.3,
        parapetMaterial = material,
    } = {}) {
        this.height = height;
        this.waterLevel = waterLevel;
        this.rects = rects;
        this.circles = circles;
        this.parapetHeight = parapetHeight;
        this.parapetThickness = parapetThickness;
        this.group = new THREE.Group();
        this.disposables = [];
        rects.forEach(rect => this.createBlock(rect, material));
        rects.filter(rect => rect.parapets).forEach(rect => this.createParapets(rect, parapetMaterial));
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

    createBlock({ minX, maxX, minZ, maxZ }, material) {
        const depth = this.height - this.waterLevel;
        this.box(maxX - minX, depth, maxZ - minZ, (minX + maxX) / 2, this.waterLevel + depth / 2, (minZ + maxZ) / 2, material);
    }

    createParapets({ minX, maxX, minZ, maxZ, parapets, parapetHeight = this.parapetHeight }, material) {
        const y = this.height + parapetHeight / 2, half = this.parapetThickness / 2;
        const edges = {
            north: [maxX - minX, this.parapetThickness, (minX + maxX) / 2, maxZ - half],
            south: [maxX - minX, this.parapetThickness, (minX + maxX) / 2, minZ + half],
            east: [this.parapetThickness, maxZ - minZ, maxX - half, (minZ + maxZ) / 2],
            west: [this.parapetThickness, maxZ - minZ, minX + half, (minZ + maxZ) / 2],
        };
        parapets.forEach(edge => {
            const [width, depth, x, z] = edges[edge];
            this.box(width, parapetHeight, depth, x, y, z, material);
        });
    }

    contains(x, z) {
        return this.rects.some(rect => x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ)
            || this.circles.some(circle => Math.hypot(x - circle.centerX, z - circle.centerZ) <= circle.radius);
    }

    walkableAreas(margin) {
        return [
            ...this.rects.filter(rect => rect.walkable !== false).map(rect => {
                const inset = edge => {
                    if (rect.joins?.includes(edge)) return 0;
                    return rect.parapets?.includes(edge) ? margin + this.parapetThickness : margin;
                };
                return { minX: rect.minX + inset('west'), maxX: rect.maxX - inset('east'), minZ: rect.minZ + inset('south'), maxZ: rect.maxZ - inset('north') };
            }),
            ...this.circles.map(circle => ({ centerX: circle.centerX, centerZ: circle.centerZ, radius: circle.radius - margin })),
        ];
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
