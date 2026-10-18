class Passage {
    constructor({
        start = [-112.8, -46],
        width = 8.8,
        length = 100,
        height = 3,
        rampLength = 16,
        landingLength = 4,
        thickness = 0.3,
        wallHeight = 3.5,
        wallThickness = 0.4,
        waterLevel = -2,
        lampSpacing = 30,
        doorSize = [1.4, 2.3],
        signSize = [1.6, 1.0],
        signHeight = 1.7,
        signGap = 0.4,
        wallMaterial = new THREE.MeshStandardMaterial({ color: 0x3a424d, roughness: 0.95 }),
        floorMaterial = new THREE.MeshStandardMaterial({ color: 0x5a626c, roughness: 0.95 }),
    } = {}) {
        this.startX = start[0];
        this.centerZ = start[1];
        this.width = width;
        this.length = length;
        this.height = height;
        this.rampLength = rampLength;
        this.landingLength = landingLength;
        this.thickness = thickness;
        this.wallHeight = wallHeight;
        this.wallThickness = wallThickness;
        this.waterLevel = waterLevel;
        this.lampSpacing = lampSpacing;
        this.doorSize = doorSize;
        this.signSize = signSize;
        this.signHeight = signHeight;
        this.signGap = signGap;
        this.wallMaterial = wallMaterial;
        this.floorMaterial = floorMaterial;
        this.disposables = [];
        this.group = new THREE.Group();
        this.grassMaterial = this.createGrass();
        this.createGround();
        this.createDescent();
        this.createWalls();
        this.createDoor();
        this.createSign();
        this.createLamps();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    get endX() {
        return this.startX - this.length;
    }

    get rampEndX() {
        return this.endX - this.rampLength;
    }

    get farX() {
        return this.rampEndX - this.landingLength;
    }

    get leftZ() {
        return this.centerZ + this.width / 2;
    }

    get rightZ() {
        return this.centerZ - this.width / 2;
    }

    contains(x, z) {
        return x <= this.startX && x >= this.farX && z >= this.rightZ && z <= this.leftZ;
    }

    floorHeight(x) {
        if (x >= this.endX) return this.height;
        if (x >= this.rampEndX) return this.height * (x - this.rampEndX) / this.rampLength;
        return 0;
    }

    walkableAreas(margin) {
        return [{ minX: this.farX + margin, maxX: this.startX + 1, minZ: this.rightZ + margin, maxZ: this.leftZ - margin }];
    }

    box(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    createGrass() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const c = canvas.getContext('2d');
        c.fillStyle = '#34502a';
        c.fillRect(0, 0, 128, 128);
        for (let blade = 0; blade < 900; blade++) {
            const shade = Math.random();
            c.fillStyle = shade < 0.5 ? `rgba(30, 52, 22, ${0.4 + shade})` : `rgba(90, 120, 60, ${shade * 0.5})`;
            c.fillRect(Math.random() * 128, Math.random() * 128, 1, 2 + Math.random() * 3);
        }
        const texture = this.track(new THREE.CanvasTexture(canvas));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(this.length / 2, this.width / 2);
        return this.track(new THREE.MeshStandardMaterial({ map: texture, roughness: 1 }));
    }

    createGround() {
        const depth = this.height - this.waterLevel;
        const ground = this.box(this.length, depth, this.width, this.startX - this.length / 2, this.waterLevel + depth / 2, this.centerZ, this.wallMaterial);
        ground.material = [this.wallMaterial, this.wallMaterial, this.grassMaterial, this.wallMaterial, this.wallMaterial, this.wallMaterial];
    }

    createDescent() {
        const angle = Math.atan2(this.height, this.rampLength);
        const slant = Math.hypot(this.rampLength, this.height);
        const slope = this.box(slant, this.thickness, this.width, this.endX - this.rampLength / 2, this.height / 2 - this.thickness / 2 / Math.cos(angle), this.centerZ, this.floorMaterial);
        slope.rotation.z = angle;
        this.box(this.landingLength, this.thickness, this.width, this.rampEndX - this.landingLength / 2, -this.thickness / 2, this.centerZ, this.floorMaterial);
        const fill = new THREE.Shape();
        fill.moveTo(this.endX, this.height - this.thickness);
        fill.lineTo(this.rampEndX, -this.thickness);
        fill.lineTo(this.farX, -this.thickness);
        fill.lineTo(this.farX, this.waterLevel);
        fill.lineTo(this.endX, this.waterLevel);
        fill.closePath();
        const mesh = new THREE.Mesh(this.track(new THREE.ExtrudeGeometry(fill, { depth: this.width, bevelEnabled: false })), this.wallMaterial);
        mesh.position.z = this.rightZ;
        this.group.add(mesh);
    }

    createWalls() {
        const top = this.height + this.wallHeight, height = top - this.waterLevel;
        const length = this.startX - this.farX, half = this.wallThickness / 2;
        [this.leftZ + half, this.rightZ - half].forEach(z => this.box(length, height, this.wallThickness, this.startX - length / 2, this.waterLevel + height / 2, z, this.wallMaterial));
        this.box(this.wallThickness, height, this.width + this.wallThickness * 2, this.farX - half, this.waterLevel + height / 2, this.centerZ, this.wallMaterial);
    }

    paintDoor() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const c = canvas.getContext('2d');
        const gradient = c.createLinearGradient(0, 0, 128, 0);
        gradient.addColorStop(0, '#4a5058');
        gradient.addColorStop(0.5, '#6a727c');
        gradient.addColorStop(1, '#4a5058');
        c.fillStyle = gradient;
        c.fillRect(0, 0, 128, 256);
        c.strokeStyle = 'rgba(20, 24, 28, 0.8)';
        c.lineWidth = 3;
        c.strokeRect(10, 10, 108, 110);
        c.strokeRect(10, 136, 108, 110);
        c.fillStyle = 'rgba(20, 24, 28, 0.5)';
        for (let y = 24; y < 110; y += 14) c.fillRect(16, y, 96, 3);
        c.fillStyle = '#2a2e33';
        [[6, 6], [122, 6], [6, 250], [122, 250], [6, 128], [122, 128]].forEach(([x, y]) => {
            c.beginPath();
            c.arc(x, y, 2.5, 0, Math.PI * 2);
            c.fill();
        });
        c.fillStyle = '#c8a020';
        c.fillRect(10, 230, 108, 10);
        c.fillStyle = '#1a1a1a';
        for (let x = 10; x < 118; x += 16) {
            c.beginPath();
            c.moveTo(x, 240);
            c.lineTo(x + 8, 230);
            c.lineTo(x + 14, 230);
            c.lineTo(x + 6, 240);
            c.fill();
        }
        return canvas;
    }

    createDoor() {
        const [width, height] = this.doorSize;
        const metal = this.track(new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.4, metalness: 0.8 }));
        const door = this.track(new THREE.MeshStandardMaterial({ map: this.track(new THREE.CanvasTexture(this.paintDoor())), roughness: 0.45, metalness: 0.7 }));
        const panel = this.box(0.08, height, width, this.farX + 0.04, height / 2, this.centerZ, metal);
        panel.material = [door, metal, metal, metal, metal, metal];
        this.box(0.14, height + 0.15, 0.12, this.farX + 0.07, (height + 0.15) / 2, this.centerZ - width / 2 - 0.06, metal);
        this.box(0.14, height + 0.15, 0.12, this.farX + 0.07, (height + 0.15) / 2, this.centerZ + width / 2 + 0.06, metal);
        this.box(0.14, 0.12, width + 0.24, this.farX + 0.07, height + 0.09, this.centerZ, metal);
        this.box(0.06, 0.04, 0.18, this.farX + 0.11, 1.05, this.centerZ + width / 2 - 0.2, metal);
        const light = new THREE.PointLight(0xff9a40, 0.8, 8);
        light.position.set(this.farX + 1.2, height + 0.5, this.centerZ);
        this.group.add(light);
        this.box(0.2, 0.1, 0.4, this.farX + 0.1, height + 0.5, this.centerZ, this.track(new THREE.MeshBasicMaterial({ color: 0xffb060 })));
    }

    createSign() {
        const z = this.centerZ + this.doorSize[0] / 2 + this.signGap + this.signSize[0] / 2;
        this.sign = new UnatcoSign({ position: [this.farX + 0.02, this.signHeight, z], facing: Math.PI / 2, size: this.signSize });
        this.group.add(this.sign.group);
    }

    createLamps() {
        this.lamps = [];
        for (let distance = this.lampSpacing; distance <= this.length; distance += this.lampSpacing) {
            const lamp = new StreetLamp({ position: [this.startX - distance, this.height, this.leftZ - 0.3], facing: Math.PI });
            this.lamps.push(lamp);
            this.group.add(lamp.group);
        }
    }

    dispose() {
        this.lamps.forEach(lamp => lamp.dispose());
        this.sign.dispose();
        this.disposables.forEach(resource => resource.dispose());
    }
}
