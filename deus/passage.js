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
        doorCaption = ['UNATCO H.Q.', 'LIBERTY ISLAND'],
        doorCaptionSize = [4, 1],
        doorCaptionHeight = 3.6,
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
        this.doorCaption = doorCaption;
        this.doorCaptionSize = doorCaptionSize;
        this.doorCaptionHeight = doorCaptionHeight;
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
        this.createDoorCaption();
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

    createDoor() {
        this.door = new MetalDoor({ position: [this.farX, 0, this.centerZ], facing: Math.PI / 2, size: this.doorSize });
        this.group.add(this.door.group);
    }

    createSign() {
        const z = this.centerZ + this.doorSize[0] / 2 + this.signGap + this.signSize[0] / 2;
        this.sign = new UnatcoSign({ position: [this.farX + 0.02, this.signHeight, z], facing: Math.PI / 2, size: this.signSize });
        this.group.add(this.sign.group);
    }

    createDoorCaption() {
        const [width, height] = this.doorCaptionSize;
        this.caption = new WallCaption({ lines: this.doorCaption, width, height, position: [this.farX + 0.02, this.doorCaptionHeight, this.centerZ], facing: Math.PI / 2 });
        this.group.add(this.caption.group);
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
        this.door.dispose();
        this.caption.dispose();
        this.disposables.forEach(resource => resource.dispose());
    }
}
