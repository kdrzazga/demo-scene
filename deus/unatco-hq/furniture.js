class Furniture extends GameObject {
    constructor({ surfaceHeight = null, surfaceRadius = 0, ...options } = {}) {
        super(options);
        this.surfaceHeight = surfaceHeight;
        this.surfaceRadius = surfaceRadius;
    }

    part(geometry, material, x, y, z, parent = this.group) {
        const mesh = new THREE.Mesh(this.track(geometry), material);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    surfaceAt(x, z) {
        if (this.surfaceHeight === null) return -Infinity;
        const inside = Math.hypot(x - this.position.x, z - this.position.z) <= this.surfaceRadius;
        return inside ? this.position.y + this.surfaceHeight : -Infinity;
    }
}
