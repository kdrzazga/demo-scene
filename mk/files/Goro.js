class Goro extends Phaser.GameObjects.Sprite {

    constructor(scene, spritesheet, config) {
        super(scene, config.leftEdge, config.baseY, spritesheet.textureKey, spritesheet.firstFrameName());
        this.spritesheet = spritesheet;
        this.leftEdge = config.leftEdge;
        this.rightEdge = config.rightEdge;
        this.walkSpeed = config.speed;
        this.leftPauseDuration = config.leftPauseMs;
        this.pauseTimer = 0;
        this.direction = Goro.RIGHT;
        this.setOrigin(0.5, 1);
        this.setScale(config.scale);
        this.setDepth(config.depth);
        scene.add.existing(this);
        this.play(spritesheet.walkAnimationKey());
    }

    walk(delta) {
        if (this.pauseTimer > 0) {
            this._countDownPause(delta);
            return;
        }
        this.x += this._directionSign() * this.walkSpeed * (delta / 1000);
        this._turnAtEdges();
        this.setFlipX(this.direction === Goro.LEFT);
    }

    _countDownPause(delta) {
        this.pauseTimer -= delta;
        if (this.pauseTimer <= 0) {
            this.pauseTimer = 0;
            this.direction = Goro.RIGHT;
            this.anims.resume();
        }
    }

    _directionSign() {
        return this.direction === Goro.RIGHT ? 1 : -1;
    }

    _turnAtEdges() {
        if (this.x >= this.rightEdge) {
            this.x = this.rightEdge;
            this.direction = Goro.LEFT;
        } else if (this.x <= this.leftEdge) {
            this.x = this.leftEdge;
            this.pauseTimer = this.leftPauseDuration;
            this.anims.pause();
        }
    }
}

Goro.LEFT = 'left';
Goro.RIGHT = 'right';
