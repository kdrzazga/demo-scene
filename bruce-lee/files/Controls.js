class Controls {
    constructor(scene) {
        const K = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({
            left: K.LEFT,
            right: K.RIGHT,
            up: K.UP,
            down: K.DOWN,
            jump: K.UP
        });
        this.punchKeys = Object.values(scene.input.keyboard.addKeys('Q,W,E,R,T,Y'));
        this.kickKeys = Object.values(scene.input.keyboard.addKeys('A,S,D,F,G,H'));
    }

    get left() { return this.keys.left.isDown; }
    get right() { return this.keys.right.isDown; }
    get up() { return this.keys.up.isDown; }
    get down() { return this.keys.down.isDown; }
    get climbHeld() { return this.keys.up.isDown || this.keys.down.isDown; }
    get jumpPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.jump); }
    get jumpReleased() { return Phaser.Input.Keyboard.JustUp(this.keys.jump); }
    get leftPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.left); }
    get rightPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.right); }
    get punchPressed() { return this.anyPressed(this.punchKeys); }
    get kickPressed() { return this.anyPressed(this.kickKeys); }

    anyPressed(keys) {
        let hit = false;
        for (const key of keys) {
            if (Phaser.Input.Keyboard.JustDown(key)) hit = true;
        }
        return hit;
    }
}
