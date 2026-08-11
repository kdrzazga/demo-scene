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
            },
            {
                name: 'spearthrow',
                top: 869,
                height: 99,
                columns: [
                    { left: 8, width: 71, footAnchor: 0.599 },
                    { left: 88, width: 84, footAnchor: 0.310 }
                ]
            },
            {
                name: 'spear',
                top: 1640,
                height: 8,
                columns: [
                    { left: 554, width: 38 }
                ]
            },
            {
                name: 'rope',
                top: 1643,
                height: 5,
                columns: [
                    { left: 476, width: 78 }
                ]
            },
            {
                name: 'sinerope',
                top: 1637,
                height: 20,
                columns: [
                    { left: 407, width: 69 }
                ]
            },
            {
                name: 'duck',
                top: 126,
                height: 90,
                columns: [
                    { left: 8, width: 49, footAnchor: 0.510 },
                    { left: 64, width: 47, footAnchor: 0.436 },
                    { left: 120, width: 51, footAnchor: 0.451 }
                ]
            },
            {
                name: 'block',
                top: 996,
                height: 100,
                columns: [
                    { left: 8, width: 44, footAnchor: 0.489 },
                    { left: 64, width: 44, footAnchor: 0.489 },
                    { left: 120, width: 45, footAnchor: 0.489 }
                ]
            },
            {
                name: 'unmask',
                top: 979,
                height: 117,
                columns: [
                    { left: 176, width: 43, footAnchor: 0.488 },
                    { left: 232, width: 43, footAnchor: 0.488 },
                    { left: 288, width: 44, footAnchor: 0.477 },
                    { left: 344, width: 62, footAnchor: 0.468 },
                    { left: 416, width: 67, footAnchor: 0.328 }
                ]
            },
            {
                name: 'flame',
                top: 1666,
                height: 150,
                columns: [
                    { left: 8, width: 12, top: 1802, height: 14 },
                    { left: 32, width: 23, top: 1794, height: 22 },
                    { left: 64, width: 46, top: 1768, height: 48 },
                    { left: 120, width: 70, top: 1747, height: 69 },
                    { left: 200, width: 67, top: 1736, height: 80 },
                    { left: 280, width: 70, top: 1678, height: 138 },
                    { left: 360, width: 33, top: 1666, height: 150 },
                    { left: 400, width: 29, top: 1684, height: 132 },
                    { left: 440, width: 23, top: 1728, height: 88 }
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
            { key: 'iceconefly', group: 'icecone', columns: [0, 1, 2], frameRate: 12, repeat: 0 },
            { key: 'spearwindup', group: 'spearthrow', columns: [0], frameRate: 6, repeat: 0 },
            { key: 'duck', group: 'duck', columns: [1, 0, 2], frameRate: 12, repeat: 0 },
            { key: 'standblock', group: 'block', columns: [0, 1], frameRate: 4, repeat: -1 },
            { key: 'unmask', group: 'unmask', columns: [0, 1, 2, 3, 4], frameRate: 5, repeat: 0 },
            { key: 'flame', group: 'flame', columns: [0, 1, 2, 3, 4, 5, 6, 7, 8], frameRate: 10, repeat: 0 }
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
            const top = column.top !== undefined ? column.top : group.top;
            const height = column.height !== undefined ? column.height : group.height;
            const frame = texture.add(frameName, 0, column.left, top, column.width, height);
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

    spearWindupAnimationKey() {
        return this._animationKey('spearwindup');
    }

    spearHoldFrameName() {
        return this._frameName('spearthrow', 1);
    }

    spearFrameName() {
        return this._frameName('spear', 0);
    }

    ropeFrameName() {
        return this._frameName('rope', 0);
    }

    sineRopeFrameName() {
        return this._frameName('sinerope', 0);
    }

    duckAnimationKey() {
        return this._animationKey('duck');
    }

    standBlockAnimationKey() {
        return this._animationKey('standblock');
    }

    crouchBlockFrameName() {
        return this._frameName('block', 2);
    }

    unmaskAnimationKey() {
        return this._animationKey('unmask');
    }

    breatheFrameName() {
        return this._frameName('unmask', 4);
    }

    flameAnimationKey() {
        return this._animationKey('flame');
    }

    flameFirstFrameName() {
        return this._frameName('flame', 0);
    }

    neutralFrameName() {
        return this._frameName('walk', 0);
    }
}
