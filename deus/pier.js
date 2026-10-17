class Pier {
    constructor({
        width = 12,
        forwardLength = 40,
        backLength = 10,
        sideLength = 66,
        deckThickness = 0.4,
        roofHeight = 3.4,
        roofRise = 0.9,
        roofOverhang = 0.6,
        postSpacing = 6,
        lampSpacing = 12,
        railingHeight = 1.1,
        railingSpacing = 2,
        pilingSpacing = 4,
        pilingDepth = 4,
    } = {}) {
        this.width = width;
        this.forwardLength = forwardLength;
        this.backLength = backLength;
        this.sideLength = sideLength;
        this.deckThickness = deckThickness;
        this.roofHeight = roofHeight;
        this.roofRise = roofRise;
        this.roofOverhang = roofOverhang;
        this.postSpacing = postSpacing;
        this.lampSpacing = lampSpacing;
        this.railingHeight = railingHeight;
        this.railingSpacing = railingSpacing;
        this.pilingSpacing = pilingSpacing;
        this.pilingDepth = pilingDepth;

        this.group = new THREE.Group();
        this.disposables = [];
        this.woodImage = this.paintWood();
        this.beamMaterial = this.track(new THREE.MeshStandardMaterial({ color: 0x2b2119, roughness: 0.9 }));
        this.roofMaterial = this.track(new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.7, metalness: 0.4, side: THREE.DoubleSide }));
        this.lampMaterial = this.track(new THREE.MeshBasicMaterial({ color: 0xffd08a }));
        this.createDeck();
        this.createPilings();
        this.createRailings();
        this.createRoof();
        this.createLamps();
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    get halfWidth() {
        return this.width / 2;
    }

    get farEdge() {
        return -this.forwardLength - this.width;
    }

    walkableAreas(margin) {
        return [
            { minX: -this.halfWidth + margin, maxX: this.halfWidth - margin, minZ: this.farEdge + margin, maxZ: this.backLength - margin },
            { minX: -this.sideLength + margin, maxX: this.halfWidth - margin, minZ: this.farEdge + margin, maxZ: -this.forwardLength - margin },
        ];
    }

    paintWood() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const c = canvas.getContext('2d');
        const planks = 8, plankWidth = 512 / planks;
        for (let index = 0; index < planks; index++) {
            const shade = 34 + Math.random() * 18;
            c.fillStyle = `rgb(${shade + 10}, ${shade}, ${shade - 10})`;
            c.fillRect(index * plankWidth, 0, plankWidth, 512);
            for (let grain = 0; grain < 40; grain++) {
                c.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
                c.fillRect(index * plankWidth + Math.random() * plankWidth, 0, 1 + Math.random() * 2, 512);
            }
            c.fillStyle = 'rgba(0, 0, 0, 0.7)';
            c.fillRect(index * plankWidth, 0, 3, 512);
            const seam = Math.random() * 512;
            c.fillRect(index * plankWidth, seam, plankWidth, 3);
        }
        return canvas;
    }

    woodMaterial(repeatX, repeatY, rotated) {
        const texture = this.track(new THREE.CanvasTexture(this.woodImage));
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        if (rotated) {
            texture.center.set(0.5, 0.5);
            texture.rotation = Math.PI / 2;
        }
        return this.track(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 }));
    }

    box(width, height, depth, x, y, z, material) {
        const mesh = new THREE.Mesh(this.track(new THREE.BoxGeometry(width, height, depth)), material);
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    createDeck() {
        const forwardDeckLength = this.forwardLength + this.backLength;
        this.box(this.width, this.deckThickness, forwardDeckLength, 0, -this.deckThickness / 2, (this.backLength - this.forwardLength) / 2,
            this.woodMaterial(this.width / 2, forwardDeckLength / 4, false));
        const sideDeckLength = this.sideLength + this.halfWidth;
        this.box(sideDeckLength, this.deckThickness, this.width, (this.halfWidth - this.sideLength) / 2, -this.deckThickness / 2, -this.forwardLength - this.halfWidth,
            this.woodMaterial(this.width / 2, sideDeckLength / 4, true));
    }

    createPilings() {
        const positions = [];
        for (let z = this.backLength; z >= this.farEdge; z -= this.pilingSpacing) positions.push([this.halfWidth, z]);
        for (let z = this.backLength; z >= -this.forwardLength; z -= this.pilingSpacing) positions.push([-this.halfWidth, z]);
        for (let x = this.halfWidth; x >= -this.sideLength; x -= this.pilingSpacing) positions.push([x, this.farEdge]);
        for (let x = -this.halfWidth; x >= -this.sideLength; x -= this.pilingSpacing) positions.push([x, -this.forwardLength]);
        const geometry = this.track(new THREE.CylinderGeometry(0.25, 0.25, this.pilingDepth, 8));
        geometry.translate(0, -this.pilingDepth / 2 - this.deckThickness, 0);
        this.addInstances(geometry, this.beamMaterial, positions.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    }

    addInstances(geometry, material, positions) {
        const mesh = new THREE.InstancedMesh(geometry, material, positions.length);
        const matrix = new THREE.Matrix4();
        positions.forEach((position, index) => mesh.setMatrixAt(index, matrix.makeTranslation(position.x, position.y, position.z)));
        this.group.add(mesh);
    }

    createRailings() {
        const rails = [
            [[this.halfWidth, this.backLength], [this.halfWidth, this.farEdge]],
            [[-this.halfWidth, this.backLength], [-this.halfWidth, -this.forwardLength]],
            [[-this.halfWidth, -this.forwardLength], [-this.sideLength, -this.forwardLength]],
            [[this.halfWidth, this.farEdge], [-this.sideLength, this.farEdge]],
        ];
        const posts = [];
        rails.forEach(([from, to]) => {
            const dx = to[0] - from[0], dz = to[1] - from[1];
            const length = Math.hypot(dx, dz);
            const rail = this.box(length, 0.12, 0.12, (from[0] + to[0]) / 2, this.railingHeight, (from[1] + to[1]) / 2, this.beamMaterial);
            rail.rotation.y = -Math.atan2(dz, dx);
            const count = Math.floor(length / this.railingSpacing);
            for (let index = 0; index <= count; index++) {
                const t = index / count;
                posts.push(new THREE.Vector3(from[0] + dx * t, 0, from[1] + dz * t));
            }
        });
        const geometry = this.track(new THREE.BoxGeometry(0.12, this.railingHeight, 0.12));
        geometry.translate(0, this.railingHeight / 2, 0);
        this.addInstances(geometry, this.beamMaterial, posts);
    }

    createRoof() {
        const nearZ = -this.forwardLength - 0.3, farZ = this.farEdge + 0.3, centerZ = -this.forwardLength - this.halfWidth;
        const roofLength = this.sideLength + this.halfWidth + this.roofOverhang * 2;
        const roofCenterX = (this.halfWidth - this.sideLength) / 2;
        const posts = [];
        for (let x = this.halfWidth - 0.3; x >= -this.sideLength; x -= this.postSpacing) {
            posts.push(new THREE.Vector3(x, 0, nearZ), new THREE.Vector3(x, 0, farZ));
        }
        const postGeometry = this.track(new THREE.BoxGeometry(0.3, this.roofHeight, 0.3));
        postGeometry.translate(0, this.roofHeight / 2, 0);
        this.addInstances(postGeometry, this.beamMaterial, posts);
        [nearZ, farZ].forEach(z => this.box(roofLength, 0.3, 0.3, roofCenterX, this.roofHeight, z, this.beamMaterial));
        const run = this.halfWidth + this.roofOverhang;
        const slope = Math.atan2(this.roofRise, this.halfWidth);
        const slant = run / Math.cos(slope);
        [1, -1].forEach(side => {
            const panel = this.box(roofLength, 0.12, slant, roofCenterX, 0, 0, this.roofMaterial);
            panel.position.set(roofCenterX, this.roofHeight + this.roofRise - Math.sin(slope) * slant / 2, centerZ + side * Math.cos(slope) * slant / 2);
            panel.rotation.x = side * slope;
        });
    }

    createLamps() {
        const centerZ = -this.forwardLength - this.halfWidth;
        this.lamps = [];
        for (let x = this.halfWidth - this.lampSpacing / 2; x >= -this.sideLength; x -= this.lampSpacing) {
            this.box(0.5, 0.15, 0.5, x, this.roofHeight + 0.2, centerZ, this.lampMaterial);
            const light = new THREE.PointLight(0xffc070, 1.1, 13);
            light.position.set(x, this.roofHeight - 0.2, centerZ);
            this.group.add(light);
            this.lamps.push(light);
        }
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
