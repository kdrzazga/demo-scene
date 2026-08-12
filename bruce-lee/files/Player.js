class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'walk0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.runSpeed = 300;
        this.jumpSpeed = 620;
        this.jumpCut = 0.4;
        this.coyoteMs = 90;
        this.groundGraceMs = 100;
        this.climbSpeed = 200;
        this.bodyWidth = 22;
        this.bodyHeight = 88;
        this.doubleTapMs = 280;
        this.comboMs = 320;
        this.throwHeight = 55;
        this.throwReach = 40;
        this.groundedAt = -Infinity;
        this.tap = { left: -Infinity, right: -Infinity };
        this.dashTime = -Infinity;
        this.dashDir = 1;
        this.pendingThrowDir = 1;
        this.attacking = false;
        this.climbing = false;
        this.escalators = [];

        this.setOrigin(0.5, 1);
        this.setDepth(10);
        this.setCollideWorldBounds(true);
        this.body.setMaxVelocity(2000, 900);
        this.on('animationcomplete', this.onAnimComplete, this);
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
        this.syncBody();
        const now = this.scene.time.now;
        const punch = controls.punchPressed;
        const kick = controls.kickPressed;
        const leftTap = controls.leftPressed;
        const rightTap = controls.rightPressed;
        const jumpPressed = controls.jumpPressed;
        const jumpReleased = controls.jumpReleased;

        if (this.attacking) {
            this.body.setVelocityX(0);
            return;
        }

        if (leftTap) {
            if (now - this.tap.left < this.doubleTapMs) { this.dashTime = now; this.dashDir = -1; }
            this.tap.left = now;
        }
        if (rightTap) {
            if (now - this.tap.right < this.doubleTapMs) { this.dashTime = now; this.dashDir = 1; }
            this.tap.right = now;
        }

        const escalator = this.escalatorUnder();

        if (this.groundedRecently() && !this.climbing) {
            if (punch && now - this.dashTime < this.comboMs && !this.scene.projectile) {
                this.startThrow(this.dashDir);
                return;
            }
            if (punch) { this.startAttack('punch'); return; }
            if (kick) { this.startAttack('kick'); return; }
        }

        if (this.climbing) {
            this.x = this.climbColumnX;
            this.body.setVelocityX(0);
            if (controls.up) this.body.setVelocityY(-this.climbSpeed);
            else if (controls.down) this.body.setVelocityY(this.climbSpeed);
            else this.body.setVelocityY(0);
            this.setFrame('walk0');
            if (!escalator || jumpPressed) this.stopClimb();
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

        if (this.isOnGround()) this.groundedAt = now;

        if (escalator && controls.climbHeld) {
            this.startClimb(escalator);
            return;
        }

        if (jumpPressed && this.canJump()) {
            this.body.setVelocityY(-this.jumpSpeed);
            this.groundedAt = -Infinity;
        } else if (jumpReleased && this.body.velocity.y < 0) {
            this.body.setVelocityY(this.body.velocity.y * this.jumpCut);
        }

        this.updateAnimation(moving);
    }

    startAttack(type) {
        this.attacking = true;
        this.body.setVelocityX(0);
        this.anims.play(type);
    }

    startThrow(direction) {
        this.attacking = true;
        this.pendingThrowDir = direction;
        this.dashTime = -Infinity;
        this.setFlipX(direction < 0);
        this.body.setVelocityX(0);
        this.anims.play('throw');
    }

    onAnimComplete(anim) {
        if (anim.key === 'punch' || anim.key === 'kick') {
            this.attacking = false;
        } else if (anim.key === 'throw') {
            this.attacking = false;
            this.scene.launchFireball(
                this.x + this.pendingThrowDir * this.throwReach,
                this.y - this.throwHeight,
                this.pendingThrowDir
            );
        }
    }

    updateAnimation(moving) {
        if (!this.groundedRecently()) {
            if (Math.abs(this.body.velocity.x) > 10) {
                this.anims.play('somersault', true);
            } else {
                this.anims.stop();
                this.setFrame('jump');
            }
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

    groundedRecently() {
        return this.scene.time.now - this.groundedAt <= this.groundGraceMs;
    }

    canJump() {
        return this.scene.time.now - this.groundedAt <= this.coyoteMs;
    }
}
