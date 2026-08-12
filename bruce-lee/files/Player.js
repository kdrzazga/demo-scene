class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'walk0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.runSpeed = 300;
        this.jumpSpeed = 620;
        this.jumpCut = 0.4;
        this.coyoteMs = 90;
        this.climbSpeed = 200;
        this.bodyWidth = 22;
        this.bodyHeight = 88;
        this.groundedAt = -Infinity;

        this.setOrigin(0.5, 1);
        this.setDepth(10);
        this.setCollideWorldBounds(true);
        this.body.setMaxVelocity(2000, 900);

        this.climbing = false;
        this.escalators = [];
    }

    fitHeight(height) {
        this.setFrame('walk0');
        this.setScale(height / this.frame.realHeight);
        return this;
    }

    setEscalators(escalators) {
        this.escalators = escalators.map(e => ({
            left: e.x,
            right: e.x + e.w,
            top: e.y,
            bottom: e.y + e.h,
            centerX: e.x + e.w / 2
        }));
        return this;
    }

    escalatorUnder() {
        const b = this.body;
        for (const e of this.escalators) {
            if (b.right > e.left && b.left < e.right && b.bottom > e.top && b.top < e.bottom) {
                return e;
            }
        }
        return null;
    }

    startClimb(escalator) {
        this.climbing = true;
        this.climbColumnX = escalator.centerX;
        this.body.setAllowGravity(false);
        this.body.setVelocity(0, 0);
    }

    stopClimb() {
        this.climbing = false;
        this.body.setAllowGravity(true);
    }

    syncBody() {
        const frameWidth = this.frame.realWidth;
        const frameHeight = this.frame.realHeight;
        this.body.setSize(this.bodyWidth, this.bodyHeight);
        this.body.setOffset((frameWidth - this.bodyWidth) / 2, frameHeight - this.bodyHeight);
    }

    update(controls) {
        const escalator = this.escalatorUnder();

        if (this.climbing) {
            this.x = this.climbColumnX;
            this.body.setVelocityX(0);
            if (controls.up) this.body.setVelocityY(-this.climbSpeed);
            else if (controls.down) this.body.setVelocityY(this.climbSpeed);
            else this.body.setVelocityY(0);
            this.setFrame('walk0');
            if (!escalator || controls.jumpPressed) this.stopClimb();
            this.syncBody();
            return;
        }

        let moving = false;
        if (controls.left) {
            this.body.setVelocityX(-this.runSpeed);
            this.setFlipX(true);
            moving = true;
        } else if (controls.right) {
            this.body.setVelocityX(this.runSpeed);
            this.setFlipX(false);
            moving = true;
        } else {
            this.body.setVelocityX(0);
        }

        if (this.isOnGround()) this.groundedAt = this.scene.time.now;

        if (escalator && controls.climbHeld) {
            this.startClimb(escalator);
            this.syncBody();
            return;
        }

        if (controls.jumpPressed && this.canJump()) {
            this.body.setVelocityY(-this.jumpSpeed);
            this.groundedAt = -Infinity;
        } else if (controls.jumpReleased && this.body.velocity.y < 0) {
            this.body.setVelocityY(this.body.velocity.y * this.jumpCut);
        }

        this.updateAnimation(moving);
        this.syncBody();
    }

    updateAnimation(moving) {
        if (!this.isOnGround()) {
            this.anims.stop();
            this.setFrame('jump');
        } else if (moving) {
            this.anims.play('walk', true);
        } else {
            this.anims.stop();
            this.setFrame('walk0');
        }
    }

    isOnGround() {
        return this.body.blocked.down || this.body.touching.down;
    }

    canJump() {
        return this.scene.time.now - this.groundedAt <= this.coyoteMs;
    }
}
