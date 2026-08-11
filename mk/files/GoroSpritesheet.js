class GoroSpritesheet {

    constructor(scene, textureKey) {
        this.scene = scene;
        this.textureKey = textureKey;
        this.walkTop = 150;
        this.walkHeight = 126;
        this.walkFrameRate = 8;
        this.walkColumns = [
            { left: 20, width: 59 },
            { left: 90, width: 57 },
            { left: 158, width: 54 },
            { left: 224, width: 62 },
            { left: 298, width: 64 },
            { left: 375, width: 58 },
            { left: 446, width: 58 },
            { left: 515, width: 61 },
            { left: 587, width: 65 }
        ];
    }

    build() {
        const texture = this.scene.textures.get(this.textureKey);
        const frames = [];
        this.walkColumns.forEach((column, index) => {
            const frameName = this._frameName(index);
            if (!texture.has(frameName)) {
                texture.add(frameName, 0, column.left, this.walkTop, column.width, this.walkHeight);
            }
            frames.push({ key: this.textureKey, frame: frameName });
        });
        if (!this.scene.anims.exists(this.walkAnimationKey())) {
            this.scene.anims.create({
                key: this.walkAnimationKey(),
                frames: frames,
                frameRate: this.walkFrameRate,
                repeat: -1
            });
        }
    }

    _frameName(index) {
        return this.textureKey + '_walk_' + index;
    }

    walkAnimationKey() {
        return this.textureKey + '_walk';
    }

    firstFrameName() {
        return this._frameName(0);
    }
}
