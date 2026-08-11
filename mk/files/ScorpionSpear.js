class ScorpionSpear extends Phaser.GameObjects.Sprite {

    constructor(scene, handX, handY, spritesheet, directionX) {
        super(scene, handX, handY, spritesheet.textureKey, spritesheet.spearFrameName());
        this.spritesheet = spritesheet;
        this.handX = handX;
        this.handY = handY;
        this.directionX = directionX;
        this.flightSpeed = 520;
        this.pieceScale = 2;
        this.maxStretch = 3;
        this.ropeNaturalWidth = 78;
        this.sineNaturalWidth = 69;

        this.setOrigin(0, 0.5);
        this.setScale(this.pieceScale);
        this.setFlipX(directionX < 0);
        this.setDepth(6);
        scene.add.existing(this);

        this.straightRope = this._addRope(spritesheet.ropeFrameName(), 4);
        this.sineRope = this._addRope(spritesheet.sineRopeFrameName(), 5);

        console.log('Get over here');
    }

    advance(delta) {
        this.x += this.directionX * this.flightSpeed * (delta / 1000);
        this._layoutRopes();
    }

    hasLeftView(viewLeft, viewRight) {
        return this.x < viewLeft - this.displayWidth || this.x > viewRight + this.displayWidth;
    }

    destroy(fromScene) {
        if (this.straightRope) this.straightRope.destroy();
        if (this.sineRope) this.sineRope.destroy();
        super.destroy(fromScene);
    }

    _addRope(frameName, depth) {
        const rope = this.scene.add.sprite(this.handX, this.handY, this.spritesheet.textureKey, frameName);
        rope.setOrigin(0, 0.5);
        rope.setScale(this.pieceScale);
        rope.setDepth(depth);
        return rope;
    }

    _layoutRopes() {
        const gap = Math.abs(this.x - this.handX);
        const reach = this.ropeNaturalWidth * this.pieceScale * this.maxStretch;
        const length = Math.min(gap, reach);
        this._spanRope(this.straightRope, this.handX, length, this.ropeNaturalWidth);
        this._spanRope(this.sineRope, this.handX, length, this.sineNaturalWidth);
    }

    _spanRope(rope, startX, length, naturalWidth) {
        rope.x = startX;
        rope.y = this.handY;
        rope.scaleX = this.directionX * (length / naturalWidth);
    }
}
