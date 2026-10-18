class WallDecal {
    constructor({
        image = null,
        position = [0, 0, 0],
        facing = 0,
        width = 1,
        height = null,
        anisotropy = 8,
        material = {},
    } = {}) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.anisotropy = anisotropy;
        this.disposables = [];
        this.group = new THREE.Group();
        this.group.position.set(...position);
        this.group.rotation.y = facing;
        this.material = this.track(new THREE.MeshStandardMaterial({ roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, ...material }));
        this.mesh = new THREE.Mesh(this.track(new THREE.PlaneGeometry(1, 1)), this.material);
        this.mesh.visible = false;
        this.group.add(this.mesh);
        this.load(this.source());
    }

    track(resource) {
        this.disposables.push(resource);
        return resource;
    }

    source() {
        return this.image;
    }

    load(source) {
        if (typeof source === 'string') new THREE.TextureLoader().load(source, texture => this.apply(texture));
        else if (source) this.apply(new THREE.CanvasTexture(source));
    }

    apply(texture) {
        this.track(texture);
        texture.anisotropy = this.anisotropy;
        this.material.map = texture;
        this.material.needsUpdate = true;
        const height = this.height ?? this.width * texture.image.height / texture.image.width;
        this.mesh.scale.set(this.width, height, 1);
        this.mesh.visible = true;
    }

    dispose() {
        this.disposables.forEach(resource => resource.dispose());
    }
}
