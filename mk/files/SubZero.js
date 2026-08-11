class SubZero extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, spritesheet) {
        super(scene, x, y, spritesheet.textureKey, spritesheet.neutralFrameName());
        this.spritesheet = spritesheet;
        this.walkSpeed = 130;
        this.facesRightByDefault = true;
        this.attacking = false;
        this.punchPhase = 'none';
        this.punchHeld = false;
        this.freezeReleaseCallback = null;
        this.setOrigin(0.5, 1);
        this.setScale(2);
        scene.add.existing(this);
    }

    handleWalkInput(directionX, delta) {
        if (this.attacking) return;
        if (directionX === 0) {
            this.stand();
            return;
        }
        this._turnToward(directionX);
        this._stepBy(directionX, delta);
        this._playWalkCycle();
    }

    highKick() {
        this._startKick(this.spritesheet.highKickAnimationKey());
    }

    lowKick() {
        this._startKick(this.spritesheet.lowKickAnimationKey());
    }

    startLowPunch() {
        if (this.attacking) return;
        this.attacking = true;
        this.punchPhase = 'lead';
        this.once('animationcomplete', this._afterLowPunchLead, this);
        this.play(this.spritesheet.lowPunchLeadAnimationKey());
    }

    throwFreeze(onRelease) {
        if (this.attacking) return;
        this.attacking = true;
        this.freezeReleaseCallback = onRelease;
        this.once('animationcomplete', this._finishFreeze, this);
        this.play(this.spritesheet.freezeThrowAnimationKey());
    }

    facingDirectionX() {
        const facingRight = this.facesRightByDefault ? !this.flipX : this.flipX;
        return facingRight ? 1 : -1;
    }

    setPunchHeld(held) {
        this.punchHeld = held;
        if (this.punchPhase === 'loop' && !held) this._endPunch();
    }

    stand() {
        if (this.attacking) return;
        this._restInIdlePose();
    }

    keepInside(minX, maxX) {
        this.x = Phaser.Math.Clamp(this.x, minX, maxX);
    }

    _startKick(animationKey) {
        if (this.attacking) return;
        this.attacking = true;
        this.once('animationcomplete', this._finishKick, this);
        this.play(animationKey);
    }

    _finishKick() {
        this.attacking = false;
        this._restInIdlePose();
    }

    _finishFreeze() {
        const release = this.freezeReleaseCallback;
        this.freezeReleaseCallback = null;
        this.attacking = false;
        this._restInIdlePose();
        if (release) release();
    }

    _afterLowPunchLead() {
        if (this.punchPhase !== 'lead') return;
        if (this.punchHeld) {
            this.punchPhase = 'loop';
            this.play(this.spritesheet.lowPunchLoopAnimationKey());
        } else {
            this._endPunch();
        }
    }

    _endPunch() {
        this.punchPhase = 'none';
        this.attacking = false;
        this._restInIdlePose();
    }

    _restInIdlePose() {
        this.stop();
        this.setFrame(this.spritesheet.neutralFrameName());
        this.setOrigin(0.5, 1);
    }

    _turnToward(directionX) {
        const movingRight = directionX > 0;
        this.setFlipX(this.facesRightByDefault ? !movingRight : movingRight);
    }

    _stepBy(directionX, delta) {
        this.x += directionX * this.walkSpeed * (delta / 1000);
    }

    _playWalkCycle() {
        this.play(this.spritesheet.walkAnimationKey(), true);
    }
}
