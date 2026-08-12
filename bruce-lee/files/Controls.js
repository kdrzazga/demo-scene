class Controls {
    constructor(scene) {
        const K = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({
            left: K.LEFT,
            right: K.RIGHT,
            up: K.UP,
            down: K.DOWN,
            jump: K.SPACE,
            kick: K.CTRL
        });
    }

    get left() { return this.keys.left.isDown; }
    get right() { return this.keys.right.isDown; }
    get up() { return this.keys.up.isDown; }
    get down() { return this.keys.down.isDown; }
    get climbHeld() { return this.keys.up.isDown || this.keys.down.isDown; }
    get jumpPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.jump); }
    get jumpReleased() { return Phaser.Input.Keyboard.JustUp(this.keys.jump); }
    get kickPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.kick); }
}
