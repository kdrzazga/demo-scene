class Ramp {
    constructor({
        start = [-66, -46],
        length = 24,
        rise = 3,
        width = 8,
        landingLength = 8,
        connectWidth = 12,
        thickness = 0.3,
        wallHeight = 3.5,
        wallThickness = 0.4,
        signPosition = 2.5,
        signHeight = 2.3,
        signSize = [1.6, 1.0],
        lampColor = 0xdde8ff,
        openSides = ['right', 'left'],
    } = {}) {
        this.startX = start[0];
        this.centerZ = start[1];
        this.length = length;
        this.rise = rise;
        this.width = width;
        this.landingLength = landingLength;
        this.connectWidth = connectWidth;
        this.thickness = thickness;
        this.wallHeight = wallHeight;
        this.wallThickness = wallThickness;
        this.signPosition = signPosition;
        this.signHeight = signHeight;
        this.signSize = signSize;
        this.lampColor = lampColor;
        this.openSides = openSides;

        this.group = new THREE.Group();
        this.disposables = [];
        this.concreteImage = this.paintConcrete();
        this.floorMaterial = this.concrete(4, 4, 0x5a626c);
        this.wallMaterial = this.concrete(6, 2, 0x3a424d);
        this.createSlope();
        this.createWalls();
        this.createSign();
        this.createFence();
        this.createLamp();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    get endX() {
        return this.startX - this.length;
    }

    get farX() {
        return this.endX - this.landingLength;
    }

    get leftZ() {
        return this.centerZ + this.width / 2;
    }

    get rightZ() {
        return this.centerZ - this.width / 2;
    }

    get topY() {
        return this.rise + this.wallHeight;
    }

    floorHeight(x, z) {
        if (x > this.startX || z > this.leftZ || z < this.rightZ) return 0;
        return Math.min(1, (this.startX - x) / this.length) * this.rise;
    }

    get endBlockSize() {
        return this.width + this.wallThickness * 2;
    }

    wallLength(side) {
        return this.openSides.includes(side) ? this.length : this.length + this.landingLength;
    }

    openingArea(margin, side, reach = 1) {
        const edge = side === 'left' ? this.leftZ : this.rightZ;
        const outward = side === 'left' ? 1 : -1;
        const zs = [edge - outward * reach, edge + outward * (this.wallThickness + reach)];
        return { minX: this.farX + margin, maxX: this.endX - margin, minZ: Math.min(...zs), maxZ: Math.max(...zs) };
    }

    walkableArea(margin) {
        return { minX: this.farX + margin, maxX: this.startX + 1, minZ: this.rightZ + margin, maxZ: this.leftZ - margin };
    }

    paintConcrete() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const c = canvas.getContext('2d');
        c.fillStyle = '#c8c8c8';
        c.fillRect(0, 0, 256, 256);
        for (let index = 0; index < 4000; index++) {
            const shade = 150 + Math.random() * 100;
            c.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.35)`;
            c.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
        }
        for (let index = 0; index < 12; index++) {
            c.fillStyle = `rgba(80, 80, 80, ${0.05 + Math.random() * 0.08})`;
            c.beginPath();
            c.ellipse(Math.random() * 256, Math.random() * 256, 20 + Math.random() * 50, 10 + Math.random() * 30, Math.random() * Math.PI, 0, Math.PI * 2);
            c.fill();
        }
        return canvas;
    }

    concrete(repeatX, repeatY, color) {
        const texture = this.track(new THREE.CanvasTexture(this.concreteImage));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        return this.track(new THREE.MeshStandardMaterial({ map: texture, color, roughness: 0.95 }));
    }

    box(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    createSlope() {
        const angle = Math.atan2(this.rise, this.length);
        const slant = Math.hypot(this.length, this.rise);
        const slope = this.box(slant, this.thickness, this.width, this.startX - this.length / 2, this.rise / 2 - this.thickness / 2 / Math.cos(angle), this.centerZ, this.floorMaterial);
        slope.rotation.z = -angle;
        this.box(this.landingLength, this.thickness, this.width, this.endX - this.landingLength / 2, this.rise - this.thickness / 2, this.centerZ, this.floorMaterial);
        const fillShape = new THREE.Shape();
        fillShape.moveTo(this.startX, -this.thickness);
        fillShape.lineTo(this.endX, this.rise - this.thickness);
        fillShape.lineTo(this.farX, this.rise - this.thickness);
        fillShape.lineTo(this.farX, -2);
        fillShape.lineTo(this.startX, -2);
        fillShape.closePath();
        const fill = new THREE.Mesh(this.track(new THREE.ExtrudeGeometry(fillShape, { depth: this.width, bevelEnabled: false })), this.wallMaterial);
        fill.position.z = this.rightZ;
        this.group.add(fill);
    }

    createWalls() {
        const height = this.topY + 2;
        const halfThickness = this.wallThickness / 2;
        [['left', this.leftZ + halfThickness], ['right', this.rightZ - halfThickness]].forEach(([side, z]) => {
            const length = this.wallLength(side);
            this.box(length, height, this.wallThickness, this.startX - length / 2, height / 2 - 2, z, this.wallMaterial);
        });
        const block = this.endBlockSize;
        this.box(block, height, block, this.farX - block / 2, height / 2 - 2, this.centerZ, this.wallMaterial);
        const gap = (this.connectWidth - this.width) / 2;
        if (gap <= 0) return;
        [this.leftZ + gap / 2, this.rightZ - gap / 2].forEach(z => this.box(this.wallThickness, height, gap, this.startX - halfThickness, height / 2 - 2, z, this.wallMaterial));
    }

    createSign() {
        const x = this.startX - this.signPosition;
        this.sign = new UnatcoSign({ position: [x, this.floorHeight(x, this.centerZ) + this.signHeight, this.leftZ - 0.02], facing: Math.PI, size: this.signSize });
        this.group.add(this.sign.group);
    }

    createFence() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const c = canvas.getContext('2d');
        c.strokeStyle = '#9aa2aa';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(64, 64);
        c.moveTo(64, 0);
        c.lineTo(0, 64);
        c.stroke();
        const texture = this.track(new THREE.CanvasTexture(canvas));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const length = this.wallLength('right'), height = 1.6;
        texture.repeat.set(length / 0.25, height / 0.25);
        const fence = new THREE.Mesh(
            this.track(new THREE.PlaneGeometry(length, height)),
            this.track(new THREE.MeshStandardMaterial({ map: texture, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.6 }))
        );
        fence.position.set(this.startX - length / 2, this.topY + height / 2, this.rightZ - this.wallThickness / 2);
        this.group.add(fence);
    }

    createLamp() {
        const x = this.endX + 1;
        this.lamp = new StreetLamp({ position: [x, this.floorHeight(x, this.centerZ), this.leftZ - 0.3], facing: Math.PI, lightColor: this.lampColor });
        this.group.add(this.lamp.group);
    }

    dispose() {
        this.lamp.dispose();
        this.sign.dispose();
        this.disposables.forEach(resource => resource.dispose());
    }
}
