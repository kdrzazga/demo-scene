class IceCone extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, spritesheet, directionX) {
        super(scene, x, y, spritesheet.textureKey, spritesheet.iceConeFirstFrameName());
        this.directionX = directionX;
        this.flightSpeed = 420;
        this.setOrigin(0.5, 0.5);
        this.setScale(2);
        this.setFlipX(directionX < 0);
        scene.add.existing(this);
        this.play(spritesheet.iceConeAnimationKey());
    }

    advance(delta) {
        this.x += this.directionX * this.flightSpeed * (delta / 1000);
    }

    hasLeft(worldWidth) {
        return this.x < -this.displayWidth || this.x > worldWidth + this.displayWidth;
    }
}
