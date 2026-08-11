class FlameBreath extends Phaser.GameObjects.Sprite {

    constructor(scene, mouthX, mouthY, groundX, groundY, spritesheet, directionX) {
        super(scene, mouthX, mouthY, spritesheet.textureKey, spritesheet.flameFirstFrameName());
        this.mouthX = mouthX;
        this.mouthY = mouthY;
        this.groundX = groundX;
        this.groundY = groundY;
        this.mouthFrameCount = 4;
        this.directionX = directionX;
        this.setScale(2);
        this.setFlipX(directionX < 0);
        this.setDepth(8);
        scene.add.existing(this);
        this.play(spritesheet.flameAnimationKey());
    }

    followSource() {
        const frame = this.anims.currentFrame;
        if (!frame) return;
        if (frame.index <= this.mouthFrameCount) {
            this.setOrigin(this.directionX > 0 ? 0 : 1, 0);
            this.setPosition(this.mouthX, this.mouthY);
        } else {
            this.setOrigin(0.5, 1);
            this.setPosition(this.groundX, this.groundY);
        }
    }
}
