class UnatcoHQ extends Level {
    constructor({
        hall = { minX: -7, maxX: 7, minZ: -6, maxZ: 6, height: 4.2 },
        corridor = { width: 3, length: 24, height: 3 },
        wallThickness = 0.3,
        wallMargin = 0.45,
        eyeHeight = 1.7,
        doorApproach = 0.9,
        doorSize = [1.4, 2.3],
        mapImage = 'unatco-hq/world.png',
        mapWidth = 6,
        mapHeight = 2.3,
        furniture = [
            new Armchair({ position: [5.9, 0, -1.25], rotation: -Math.PI / 2 }),
            new Armchair({ position: [5.9, 0, 1.25], rotation: -Math.PI / 2 }),
            new SideTable({ position: [6.15, 0, 0] }),
            new SideTable({ position: [1.05, 0, -16] }),
        ],
        npcs = [new UnatcoTroop({ position: [-5.4, 0, 2.6], rotation: Math.PI / 2 + 0.3 })],
        objects = [new CandyBar({ position: [1.05, 0.62 + 0.0175, -16], rotation: 0.4 })],
        ambientLight = 0.75,
        skyLight = 0.6,
        hallLightIntensity = 1.4,
        hallLightRange = 12,
        hallLightSpacing = [4.5, 4],
        corridorLightIntensity = 1.2,
        corridorLightRange = 8,
        corridorLightSpacing = 4,
        ...levelOptions
    } = {}) {
        super({ fogColor: 0x9aa4b2, fogDensity: 0.004, cameraFar: 200, fadeInDuration: 1.5, ...levelOptions });
        this.lighting = {
            ambientLight, skyLight, hallLightIntensity, hallLightRange, hallLightSpacing,
            corridorLightIntensity, corridorLightRange, corridorLightSpacing,
        };
        this.hall = hall;
        this.corridor = corridor;
        this.wallThickness = wallThickness;
        this.doorApproach = doorApproach;
        this.structure = new THREE.Group();
        this.scene.add(this.structure);
        this.materials = this.createMaterials();
        this.createHall();
        this.createCorridor();
        this.dressWalls(mapWidth);
        this.createLights();
        this.furniture = furniture;
        this.furniture.forEach(piece => this.scene.add(piece.group));
        this.lamp = new TableLamp({ position: [6.15, 0.62, 0] });
        this.scene.add(this.lamp.group);
        this.worldMap = new WallDecal({ image: mapImage, width: mapWidth, position: [hall.minX + 0.02, mapHeight, 0], facing: Math.PI / 2 });
        this.scene.add(this.worldMap.group);
        this.door = new MetalDoor({ position: [0, 0, hall.maxZ], facing: Math.PI, size: doorSize });
        this.scene.add(this.door.group);
        const { x, z } = this.arrival;
        this.setUp({
            cameraPosition: [x, eyeHeight, z],
            lookAt: [x, eyeHeight - 0.1, z - 10],
            walkableAreas: this.walkableAreas(wallMargin),
            obstacles: this.furniture,
            npcs,
            objects,
        });
    }

    get doorPosition() {
        return [0, this.hall.maxZ - this.doorApproach];
    }

    get doorInward() {
        return [0, -1];
    }

    get corridorEnd() {
        return this.hall.minZ - this.corridor.length;
    }

    walkableAreas(margin) {
        const { minX, maxX, minZ, maxZ } = this.hall, half = this.corridor.width / 2;
        return [
            { minX: minX + margin, maxX: maxX - margin, minZ: minZ + margin, maxZ: maxZ - margin },
            { minX: -half + margin, maxX: half - margin, minZ: this.corridorEnd + margin, maxZ: minZ + margin + 0.5 },
        ];
    }

    groundHeight(x, z) {
        return Math.max(0, ...this.furniture.map(piece => piece.surfaceAt(x, z)));
    }

    get blockers() {
        return [this.structure, ...this.furniture.map(piece => piece.group), ...super.blockers];
    }

    paint(width, height, draw) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        draw(canvas.getContext('2d'), width, height);
        return canvas;
    }

    surface(canvas, repeatX, repeatY, options = {}) {
        const map = this.track(new THREE.CanvasTexture(canvas));
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(repeatX, repeatY);
        return this.track(new THREE.MeshStandardMaterial({ map, ...options }));
    }

    createMaterials() {
        const tiles = this.paint(128, 128, (c, width, height) => {
            c.fillStyle = '#2a2f38';
            c.fillRect(0, 0, width, height);
            for (let index = 0; index < 600; index++) {
                c.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.04})`;
                c.fillRect(Math.random() * width, Math.random() * height, 2, 2);
            }
            c.strokeStyle = '#161a20';
            c.lineWidth = 3;
            c.strokeRect(0, 0, width, height);
        });
        const panels = this.paint(128, 256, (c, width, height) => {
            const gradient = c.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#8a96a6');
            gradient.addColorStop(1, '#6c7888');
            c.fillStyle = gradient;
            c.fillRect(0, 0, width, height);
            c.fillStyle = '#4a5462';
            c.fillRect(0, 0, 3, height);
            c.fillRect(0, height * 0.7, width, 3);
            c.fillStyle = '#2c323c';
            c.fillRect(0, height - 18, width, 18);
        });
        const ceiling = this.paint(128, 128, (c, width, height) => {
            c.fillStyle = '#3a404a';
            c.fillRect(0, 0, width, height);
            c.strokeStyle = '#262a32';
            c.lineWidth = 2;
            c.strokeRect(0, 0, width, height);
        });
        return { tiles, panels, ceiling };
    }

    slab(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        this.structure.add(mesh);
        return mesh;
    }

    wallMaterial(length, height) {
        return this.surface(this.materials.panels, length / 1.5, height / 3.2, { color: 0xdfe6ee, roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide });
    }

    createHall() {
        const { minX, maxX, minZ, maxZ, height } = this.hall, t = this.wallThickness;
        const width = maxX - minX, depth = maxZ - minZ, centerX = (minX + maxX) / 2, centerZ = (minZ + maxZ) / 2;
        const half = this.corridor.width / 2;
        this.slab(width, 0.2, depth, centerX, -0.1, centerZ, this.surface(this.materials.tiles, width / 1.2, depth / 1.2, { roughness: 0.4, metalness: 0.2 }));
        this.slab(width, 0.2, depth, centerX, height + 0.1, centerZ, this.surface(this.materials.ceiling, width / 2, depth / 2, { roughness: 0.9 }));
        this.slab(t, height, depth, minX - t / 2, height / 2, centerZ, this.wallMaterial(depth, height));
        this.slab(t, height, depth, maxX + t / 2, height / 2, centerZ, this.wallMaterial(depth, height));
        this.slab(width, height, t, centerX, height / 2, maxZ + t / 2, this.wallMaterial(width, height));
        const sideWidth = (width - this.corridor.width) / 2;
        [minX + sideWidth / 2, maxX - sideWidth / 2].forEach(x => this.slab(sideWidth, height, t, x, height / 2, minZ - t / 2, this.wallMaterial(sideWidth, height)));
        const lintel = height - this.corridor.height;
        this.slab(this.corridor.width, lintel, t, 0, this.corridor.height + lintel / 2, minZ - t / 2, this.wallMaterial(this.corridor.width, lintel));
        [-1, 1].forEach(side => this.slab(0.12, this.corridor.height, 0.4, side * (half + 0.06), this.corridor.height / 2, minZ - 0.05, this.trim()));
    }

    dressWalls(mapWidth) {
        const { minX, maxX, minZ, maxZ, height } = this.hall, half = this.corridor.width / 2, end = this.corridorEnd;
        const doorGap = [(maxX - minX) / 2 - 0.85, (maxX - minX) / 2 + 0.85];
        const mapGap = [(maxZ - minZ) / 2 - mapWidth / 2 - 0.2, (maxZ - minZ) / 2 + mapWidth / 2 + 0.2];
        [
            { from: [minX, minZ], to: [minX, maxZ], inward: [1, 0], height, gaps: [mapGap], baseGaps: [] },
            { from: [maxX, minZ], to: [maxX, maxZ], inward: [-1, 0], height },
            { from: [minX, maxZ], to: [maxX, maxZ], inward: [0, -1], height, gaps: [doorGap], baseGaps: [doorGap] },
            { from: [minX, minZ], to: [-half, minZ], inward: [0, 1], height },
            { from: [half, minZ], to: [maxX, minZ], inward: [0, 1], height },
            { from: [-half, minZ], to: [-half, end], inward: [1, 0], height: this.corridor.height },
            { from: [half, minZ], to: [half, end], inward: [-1, 0], height: this.corridor.height },
            { from: [-half, end], to: [half, end], inward: [0, 1], height: this.corridor.height, gaps: [[0, Infinity]] },
        ].forEach(wall => this.dressWall(wall));
    }

    dressWall({ from, to, inward, height, gaps = [], baseGaps = gaps.filter(gap => gap[1] !== Infinity), pilasterSpacing = 3 }) {
        const [x0, z0] = from, [x1, z1] = to, [nx, nz] = inward;
        const length = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / length, uz = (z1 - z0) / length;
        const yaw = Math.atan2(uz, ux);
        const piece = (start, stop, depth, pieceHeight, y) => {
            const middle = (start + stop) / 2, offset = depth / 2;
            const mesh = this.slab(stop - start, pieceHeight, depth, x0 + ux * middle + nx * offset, y, z0 + uz * middle + nz * offset, this.trim());
            mesh.rotation.y = -yaw;
        };
        const blocked = (position, list) => list.some(([start, stop]) => position >= start && position <= stop);
        let start = 0;
        const cuts = [...baseGaps].sort((a, b) => a[0] - b[0]);
        cuts.forEach(([gapStart, gapStop]) => {
            if (gapStart > start) piece(start, gapStart, 0.04, 0.14, 0.07);
            start = Math.max(start, gapStop);
        });
        if (start < length) piece(start, length, 0.04, 0.14, 0.07);
        piece(0, length, 0.05, 0.08, height - 0.25);
        for (let along = pilasterSpacing; along < length - 0.5; along += pilasterSpacing) {
            if (!blocked(along, gaps)) piece(along - 0.15, along + 0.15, 0.12, height, height / 2);
        }
    }

    trim() {
        this.trimMaterial ??= this.track(new THREE.MeshStandardMaterial({ color: 0x3a414c, roughness: 0.4, metalness: 0.6 }));
        return this.trimMaterial;
    }

    createCorridor() {
        const { width, length, height } = this.corridor, t = this.wallThickness, half = width / 2;
        const startZ = this.hall.minZ, centerZ = startZ - length / 2;
        this.slab(width, 0.2, length, 0, -0.1, centerZ, this.surface(this.materials.tiles, width / 1.2, length / 1.2, { roughness: 0.4, metalness: 0.2 }));
        this.slab(width, 0.2, length, 0, height + 0.1, centerZ, this.surface(this.materials.ceiling, width / 2, length / 2, { roughness: 0.9 }));
        [-1, 1].forEach(side => this.slab(t, height, length, side * (half + t / 2), height / 2, centerZ, this.wallMaterial(length, height)));
        this.slab(width + t * 2, height, t, 0, height / 2, this.corridorEnd - t / 2, this.wallMaterial(width, height));
    }

    ceilingLight(x, y, z, intensity, range) {
        this.lightPanelMaterial ??= this.track(new THREE.MeshBasicMaterial({ color: 0xe8f0ff }));
        this.slab(1.2, 0.04, 0.4, x, y - 0.02, z, this.lightPanelMaterial);
        const light = new THREE.PointLight(0xdfe8ff, intensity, range);
        light.position.set(x, y - 0.4, z);
        this.scene.add(light);
    }

    createLights() {
        const lighting = this.lighting, { minX, maxX, minZ, maxZ, height } = this.hall;
        this.scene.add(new THREE.AmbientLight(0xe8eef8, lighting.ambientLight));
        this.scene.add(new THREE.HemisphereLight(0xf0f4ff, 0x404650, lighting.skyLight));
        const [spacingX, spacingZ] = lighting.hallLightSpacing;
        for (let x = minX + spacingX / 2; x < maxX; x += spacingX) {
            for (let z = minZ + spacingZ / 2; z < maxZ; z += spacingZ) this.ceilingLight(x, height, z, lighting.hallLightIntensity, lighting.hallLightRange);
        }
        for (let z = minZ - lighting.corridorLightSpacing / 2; z > this.corridorEnd; z -= lighting.corridorLightSpacing) {
            this.ceilingLight(0, this.corridor.height, z, lighting.corridorLightIntensity, lighting.corridorLightRange);
        }
    }

    disposeWorld() {
        this.furniture.forEach(piece => piece.dispose());
        this.lamp.dispose();
        this.worldMap.dispose();
        this.door.dispose();
    }
}
