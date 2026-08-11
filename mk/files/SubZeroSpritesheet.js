class SubZeroSpritesheet {

    constructor(scene, textureKey) {
        this.scene = scene;
        this.textureKey = textureKey;
        this.frameGroups = [
            {
                name: 'walk',
                top: 13,
                height: 99,
                columns: this._uniformColumns(8, 64, 64, 10)
            },
            {
                name: 'kick',
                top: 478,
                height: 98,
                columns: [
                    { left: 8, width: 62, footAnchor: 0.476 },
                    { left: 80, width: 87, footAnchor: 0.374 },
                    { left: 176, width: 93, footAnchor: 0.328 }
                ]
            },
            {
                name: 'lowpunch',
                top: 226,
                height: 102,
                columns: [
                    { left: 8, width: 50, footAnchor: 0.500 },
                    { left: 72, width: 51, footAnchor: 0.480 },
                    { left: 136, width: 48, footAnchor: 0.448 },
                    { left: 264, width: 80, footAnchor: 0.281 },
                    { left: 352, width: 80, footAnchor: 0.275 }
                ]
            },
            {
                name: 'throw',
                top: 767,
                height: 81,
                columns: [
                    { left: 312, width: 61, footAnchor: 0.443 },
                    { left: 384, width: 69, footAnchor: 0.384 }
                ]
            },
            {
                name: 'icecone',
                top: 1623,
                height: 33,
                columns: [
                    { left: 120, width: 7 },
                    { left: 136, width: 46 },
                    { left: 192, width: 59 }
                ]
            }
        ];
        this.animations = [
            { key: 'walk', group: 'walk', columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], frameRate: 12, repeat: -1 },
            { key: 'highkick', group: 'kick', columns: [0, 1], frameRate: 6, repeat: 0 },
            { key: 'lowkick', group: 'kick', columns: [0, 2], frameRate: 6, repeat: 0 },
            { key: 'lowpunchlead', group: 'lowpunch', columns: [1, 2, 3], frameRate: 7, repeat: 0 },
            { key: 'lowpunchloop', group: 'lowpunch', columns: [0, 3, 1, 4], frameRate: 7, repeat: -1 },
            { key: 'freezethrow', group: 'throw', columns: [0, 1], frameRate: 8, repeat: 0, durations: [0, 300] },
            { key: 'iceconefly', group: 'icecone', columns: [0, 1, 2], frameRate: 12, repeat: 0 }
        ];
    }

    build() {
        this.frameGroups.forEach(group => this._sliceGroup(group));
        this.animations.forEach(animation => this._createAnimation(animation));
    }

    _uniformColumns(firstLeft, pitch, width, count) {
        const columns = [];
        for (let index = 0; index < count; index++) {
            columns.push({ left: firstLeft + index * pitch, width: width });
        }
        return columns;
    }

    _sliceGroup(group) {
        const texture = this.scene.textures.get(this.textureKey);
        group.columns.forEach((column, index) => {
            const frameName = this._frameName(group.name, index);
            if (texture.has(frameName)) return;
            const frame = texture.add(frameName, 0, column.left, group.top, column.width, group.height);
            if (frame && column.footAnchor !== undefined) {
                frame.customPivot = true;
                frame.pivotX = column.footAnchor;
                frame.pivotY = 1;
            }
        });
    }

    _createAnimation(animation) {
        const animationKey = this._animationKey(animation.key);
        if (this.scene.anims.exists(animationKey)) return;
        const frames = animation.columns.map((column, index) => {
            const frame = { key: this.textureKey, frame: this._frameName(animation.group, column) };
            if (animation.durations) frame.duration = animation.durations[index];
            return frame;
        });
        this.scene.anims.create({
            key: animationKey,
            frames: frames,
            frameRate: animation.frameRate,
            repeat: animation.repeat
        });
    }

    _frameName(groupName, column) {
        return this.textureKey + '_' + groupName + '_' + column;
    }

    _animationKey(name) {
        return this.textureKey + '_' + name;
    }

    walkAnimationKey() {
        return this._animationKey('walk');
    }

    highKickAnimationKey() {
        return this._animationKey('highkick');
    }

    lowKickAnimationKey() {
        return this._animationKey('lowkick');
    }

    lowPunchLeadAnimationKey() {
        return this._animationKey('lowpunchlead');
    }

    lowPunchLoopAnimationKey() {
        return this._animationKey('lowpunchloop');
    }

    freezeThrowAnimationKey() {
        return this._animationKey('freezethrow');
    }

    iceConeAnimationKey() {
        return this._animationKey('iceconefly');
    }

    iceConeFirstFrameName() {
        return this._frameName('icecone', 0);
    }

    neutralFrameName() {
        return this._frameName('walk', 0);
    }
}
