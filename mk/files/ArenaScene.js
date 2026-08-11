class ArenaScene extends Phaser.Scene {

    constructor() {
        super('arena');
        this.arenaWidth = 1000;
        this.arenaHeight = 320;
        this.groundLine = 300;
        this.spawnX = 220;
        this.edgeMargin = 40;
        this.iceCone = null;
        this.scorpionSpear = null;
        this.flame = null;
        this.fatalityActive = false;
        this.motionBuffer = [];
        this.freezeMotionWindow = 500;
        this.muzzleForward = 70;
        this.muzzleHeight = 130;
        this.flameGroundForward = 235;
        this.arenas = [
            { key: 'warrior', file: 'files/arenas/WARRIOR_SHRINE_HD.png' },
            { key: 'mk2cave', file: 'files/arenas/mk2cave.png' },
            { key: 'pit', file: 'files/arenas/pit.png' },
            { key: 'gorolair', file: 'files/arenas/gorolair.png' },
            { key: 'palace', file: 'files/arenas/PalaceGates.png' }
        ];
        this.arenaIndex = 0;
    }

    preload() {
        this.arenas.forEach(arena => this.load.image(arena.key, arena.file));
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
        this._checkArenaSwitch();
        if (this.fatalityActive) {
            this._updateFatality();
            return;
        }
        this._recordMotion();
        this._readAttackInput();
        this._updateStance(delta);
        this.subZero.keepInside(this.edgeMargin, this.arenaWidth - this.edgeMargin);
        this._updateIceCone(delta);
        this._updateScorpionSpear(delta);
    }

    _paintArena() {
        this.arenaImage = this.add.image(0, 0, this.arenas[this.arenaIndex].key).setOrigin(0, 0);
        this.arenaImage.setDisplaySize(this.arenaWidth, this.arenaHeight);
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
        this.blockKeys = [this.input.keyboard.addKey(keyCodes.Y), this.input.keyboard.addKey(keyCodes.FIVE)];
        this.arenaSwitchKeys = [keyCodes.F2, keyCodes.F3, keyCodes.F4, keyCodes.F5, keyCodes.F6, keyCodes.F7, keyCodes.F8, keyCodes.F9]
            .map(code => this.input.keyboard.addKey(code, true));
    }

    _showHint() {
        this.add.text(10, 8, 'ARROWS move   DOWN duck   Y/5 block   1/G punch   3/J lowkick   9/U highkick\nDOWN,FWD+P freeze    FWD,FWD+P spear    BLOCK+UP,UP fatality    F2-F9 next arena', {
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
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this._pushMotion('up', now);
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

    _updateStance(delta) {
        if (this.subZero.attacking) {
            this.subZero.cancelDuck();
            this.subZero.cancelBlock();
            return;
        }
        if (this._anyDown(this.blockKeys)) {
            if (this._isFatalityMotion()) this._startFatality();
            else this.subZero.block(this.cursors.down.isDown);
            return;
        }
        this.subZero.stopBlock();
        if (this.cursors.down.isDown) {
            this.subZero.duck();
            return;
        }
        this.subZero.standUp();
        this.subZero.handleWalkInput(this._walkDirection(), delta);
    }

    _handlePunchPress() {
        if (this._freezeReady() && this._isFreezeMotion()) this._throwFreeze();
        else if (this._spearReady() && this._isSpearMotion()) this._throwSpear();
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

    _spearReady() {
        return !this.scorpionSpear && !this.subZero.attacking;
    }

    _isSpearMotion() {
        const forwardToken = this.subZero.facingDirectionX() > 0 ? 'right' : 'left';
        let taps = 0;
        for (let i = 0; i < this.motionBuffer.length; i++) {
            if (this.motionBuffer[i].token === forwardToken) taps++;
        }
        return taps >= 2;
    }

    _throwSpear() {
        this.motionBuffer = [];
        this.subZero.throwSpear(() => this._spawnScorpionSpear());
    }

    _spawnScorpionSpear() {
        const hand = this.subZero.handWorldPosition();
        this.scorpionSpear = new ScorpionSpear(this, hand.x, hand.y, this.spritesheet, this.subZero.facingDirectionX());
    }

    _updateScorpionSpear(delta) {
        if (!this.scorpionSpear) return;
        this.scorpionSpear.advance(delta);
        const camera = this.cameras.main;
        if (this.scorpionSpear.hasLeftView(camera.scrollX, camera.scrollX + camera.width)) {
            this.scorpionSpear.destroy();
            this.scorpionSpear = null;
            this.subZero.endSpear();
        }
    }

    _isFatalityMotion() {
        let taps = 0;
        for (let i = 0; i < this.motionBuffer.length; i++) {
            if (this.motionBuffer[i].token === 'up') taps++;
        }
        return taps >= 2;
    }

    _startFatality() {
        this.motionBuffer = [];
        this.fatalityActive = true;
        this.subZero.cancelBlock();
        this.subZero.startFatality(() => this._spawnFlame());
    }

    _spawnFlame() {
        const facing = this.subZero.facingDirectionX();
        const mouth = this.subZero.mouthWorldPosition();
        const groundX = this.subZero.x + facing * this.flameGroundForward;
        this.flame = new FlameBreath(this, mouth.x, mouth.y, groundX, this.groundLine, this.spritesheet, facing);
        this.flame.once('animationcomplete', this._endFatality, this);
    }

    _endFatality() {
        if (this.flame) {
            this.flame.destroy();
            this.flame = null;
        }
        this.subZero.endFatality();
        this.fatalityActive = false;
    }

    _updateFatality() {
        if (this.flame) this.flame.followSource();
    }

    _checkArenaSwitch() {
        if (this._anyJustDown(this.arenaSwitchKeys)) this._nextArena();
    }

    _nextArena() {
        this.arenaIndex = (this.arenaIndex + 1) % this.arenas.length;
        this.arenaImage.setTexture(this.arenas[this.arenaIndex].key);
        this.arenaImage.setDisplaySize(this.arenaWidth, this.arenaHeight);
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
