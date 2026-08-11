class ArenaScene extends Phaser.Scene {

    constructor() {
        super('arena');
        this.arenaWidth = 1000;
        this.arenaHeight = 320;
        this.groundLine = 300;
        this.spawnX = 220;
        this.edgeMargin = 40;
        this.iceCone = null;
        this.motionBuffer = [];
        this.freezeMotionWindow = 500;
        this.muzzleForward = 70;
        this.muzzleHeight = 130;
    }

    preload() {
        this.load.image('arena', 'files/WARRIOR_SHRINE_HD.png');
        this.load.image('subzero', 'files/subzero.png');
        this.load.audio('freeze', 'files/freeze.mp3');
    }

    create() {
        this._paintArena();
        this._spawnSubZero();
        this._followSubZero();
        this._bindKeyboard();
        this._showHint();
    }

    update(time, delta) {
        this._recordMotion();
        this._readAttackInput();
        this.subZero.handleWalkInput(this._walkDirection(), delta);
        this.subZero.keepInside(this.edgeMargin, this.arenaWidth - this.edgeMargin);
        this._updateIceCone(delta);
    }

    _paintArena() {
        this.add.image(0, 0, 'arena').setOrigin(0, 0);
    }

    _spawnSubZero() {
        this.spritesheet = new SubZeroSpritesheet(this, 'subzero');
        this.spritesheet.build();
        this.subZero = new SubZero(this, this.spawnX, this.groundLine, this.spritesheet);
    }

    _followSubZero() {
        this.cameras.main.setBounds(0, 0, this.arenaWidth, this.arenaHeight);
        this.cameras.main.startFollow(this.subZero, true, 0.12, 0.12);
    }

    _bindKeyboard() {
        const keyCodes = Phaser.Input.Keyboard.KeyCodes;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.highKickKeys = [this.input.keyboard.addKey(keyCodes.NINE), this.input.keyboard.addKey(keyCodes.U)];
        this.lowKickKeys = [this.input.keyboard.addKey(keyCodes.THREE), this.input.keyboard.addKey(keyCodes.J)];
        this.lowPunchKeys = [this.input.keyboard.addKey(keyCodes.ONE), this.input.keyboard.addKey(keyCodes.G)];
    }

    _showHint() {
        this.add.text(10, 8, 'ARROWS walk   1/G low punch   3/J low kick   9/U high kick   DOWN,FWD+PUNCH freeze', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#bfefff'
        }).setScrollFactor(0).setDepth(10);
    }

    _recordMotion() {
        const now = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) this._pushMotion('down', now);
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this._pushMotion('left', now);
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this._pushMotion('right', now);
        this.motionBuffer = this.motionBuffer.filter(entry => now - entry.time <= this.freezeMotionWindow);
    }

    _pushMotion(token, now) {
        this.motionBuffer.push({ token: token, time: now });
    }

    _readAttackInput() {
        if (this._anyJustDown(this.highKickKeys)) this.subZero.highKick();
        else if (this._anyJustDown(this.lowKickKeys)) this.subZero.lowKick();
        else if (this._anyJustDown(this.lowPunchKeys)) this._handlePunchPress();
        this.subZero.setPunchHeld(this._anyDown(this.lowPunchKeys));
    }

    _handlePunchPress() {
        if (this._freezeReady() && this._isFreezeMotion()) this._throwFreeze();
        else this.subZero.startLowPunch();
    }

    _freezeReady() {
        return !this.iceCone && !this.subZero.attacking;
    }

    _isFreezeMotion() {
        const forwardToken = this.subZero.facingDirectionX() > 0 ? 'right' : 'left';
        let forwardTime = null;
        for (let i = this.motionBuffer.length - 1; i >= 0; i--) {
            const entry = this.motionBuffer[i];
            if (entry.token === forwardToken && forwardTime === null) forwardTime = entry.time;
            if (entry.token === 'down' && forwardTime !== null && entry.time <= forwardTime) return true;
        }
        return false;
    }

    _throwFreeze() {
        this.motionBuffer = [];
        this.subZero.throwFreeze(() => this._spawnIceCone());
    }

    _spawnIceCone() {
        const direction = this.subZero.facingDirectionX();
        const muzzleX = this.subZero.x + direction * this.muzzleForward;
        const muzzleY = this.subZero.y - this.muzzleHeight;
        this.iceCone = new IceCone(this, muzzleX, muzzleY, this.spritesheet, direction);
        this.sound.play('freeze');
    }

    _updateIceCone(delta) {
        if (!this.iceCone) return;
        this.iceCone.advance(delta);
        if (this.iceCone.hasLeft(this.arenaWidth)) {
            this.iceCone.destroy();
            this.iceCone = null;
        }
    }

    _anyJustDown(keys) {
        return keys.some(key => Phaser.Input.Keyboard.JustDown(key));
    }

    _anyDown(keys) {
        return keys.some(key => key.isDown);
    }

    _walkDirection() {
        if (this.cursors.left.isDown) return -1;
        if (this.cursors.right.isDown) return 1;
        return 0;
    }
}
