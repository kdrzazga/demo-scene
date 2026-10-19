class Graffiti extends WallDecal {
    constructor({ alphaCutoff = 0.4, ...options } = {}) {
        super({ width: 3, ...options, material: { alphaTest: alphaCutoff, roughness: 0.8 } });
    }
}
