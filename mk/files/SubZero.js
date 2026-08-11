class SubZero extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, spritesheet) {
        super(scene, x, y, spritesheet.textureKey, spritesheet.neutralFrameName());
        this.spritesheet = spritesheet;
        this.walkSpeed = 130;
        this.facesRightByDefault = true;
        this.attacking = false;
        this.ducking = false;
        this.jumping = false;
        this.blocking = false;
        this.blockMode = 'none';
        this.punchPhase = 'none';
        this.punchHeld = false;
        this.freezeReleaseCallback = null;
        this.spearReleaseCallback = null;
        this.spearHandOffsetX = 104;
        this.spearHandOffsetY = -168;
        this.breatheCallback = null;
        this.mouthOffsetX = 82;
        this.mouthOffsetY = -125;
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

    throwSpear(onRelease) {
        if (this.attacking) return;
        this.attacking = true;
        this.spearReleaseCallback = onRelease;
        this.once('animationcomplete', this._afterSpearWindup, this);
        this.play(this.spritesheet.spearWindupAnimationKey());
    }

    endSpear() {
        this.attacking = false;
        this._restInIdlePose();
    }

    startFatality(onBreathe) {
        this.breatheCallback = onBreathe;
        this.once('animationcomplete', this._afterUnmask, this);
        this.play(this.spritesheet.unmaskAnimationKey());
    }

    endFatality() {
        this._restInIdlePose();
    }

    mouthWorldPosition() {
        return {
            x: this.x + this.facingDirectionX() * this.mouthOffsetX,
            y: this.y + this.mouthOffsetY
        };
    }

    _afterUnmask() {
        this.setFrame(this.spritesheet.breatheFrameName());
        const breathe = this.breatheCallback;
        this.breatheCallback = null;
        if (breathe) breathe();
    }

    handWorldPosition() {
        return {
            x: this.x + this.facingDirectionX() * this.spearHandOffsetX,
            y: this.y + this.spearHandOffsetY
        };
    }

    _afterSpearWindup() {
        this.setFrame(this.spritesheet.spearHoldFrameName());
        const release = this.spearReleaseCallback;
        this.spearReleaseCallback = null;
        if (release) release();
    }

    setPunchHeld(held) {
        this.punchHeld = held;
        if (this.punchPhase === 'loop' && !held) this._endPunch();
    }

    duck() {
        if (this.attacking || this.ducking) return;
        this.ducking = true;
        this.play(this.spritesheet.duckAnimationKey());
    }

    standUp() {
        if (!this.ducking) return;
        this.ducking = false;
        this._restInIdlePose();
    }

    cancelDuck() {
        this.ducking = false;
    }

    block(crouching) {
        if (this.attacking) return;
        const mode = crouching ? 'crouch' : 'stand';
        if (this.blocking && this.blockMode === mode) return;
        this.ducking = false;
        this.blocking = true;
        this.blockMode = mode;
        if (crouching) {
            this.stop();
            this.setFrame(this.spritesheet.crouchBlockFrameName());
        } else {
            this.play(this.spritesheet.standBlockAnimationKey());
        }
    }

    stopBlock() {
        if (!this.blocking) return;
        this.blocking = false;
        this.blockMode = 'none';
        this._restInIdlePose();
    }

    cancelBlock() {
        this.blocking = false;
        this.blockMode = 'none';
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
