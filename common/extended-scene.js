class ExtendedScene extends Phaser.Scene {

    constructor(name){
        super(name);

        this.enemyTextures = [];

        this.player = null;

        this.playerCanJump = true;
        this.playerFalling = false;
        this.spriteGroup = null;
        this.backgroundColor = 0;
    }

    create(){
        this.spriteGroup = this.add.group();
        this.playerCanJump = true;
        this.playerFalling = false;
    }

    update(time, delta) {
        this.cameras.main.setBackgroundColor(this.backgroundColor);

        this.moveEnemies(time);
    }

    checkJumpKeys(duration){
        const ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        const shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        if (this.input.keyboard.checkDown(ctrlKey, 100) ||
            this.input.keyboard.checkDown(shiftKey, 100) ||
            this.input.keyboard.checkDown(spaceKey, 100) ||
            this.input.mousePointer.isDown) {
                this.jump(duration);
            }
    }

    jump(duration) {
        if (!this.playerCanJump || this.playerFalling) return;

        this.playerCanJump = false;
        const jumpHeight = 100;

        const jumpTween = {
            targets: this.player,
            y: this.player.y - jumpHeight,
            duration: duration / 2, // move up for half the duration
            ease: 'Linear',
            onComplete: () => {

                const comeDownTween = {
                    targets: this.player,
                    y: this.player.y + jumpHeight, // Move down
                    duration: duration / 2,
                    ease: 'Linear',
                    onComplete: () => {
                        this.playerCanJump = true;
                    }
                };
                this.tweens.add(comeDownTween);
            }
        }

        this.tweens.add(jumpTween);
    }

    moveEnemies(time){
        this.spriteGroup.children.iterate((child)=> {
            if (this._isEnemy(child)) {
                child.x -= child.speedX;
                child.y += child.speedY;
            }
        });
    }

    checkEnemyCollision() {
        if (this.spriteGroup == undefined)
            return;

        this.spriteGroup.children.iterate((child) => {
            if (this._isEnemy(child) || child.texture.key == 'h'){
                this._checkEnemyDistance(child, this.commando.x, this.commando.y, 50, () => {
                    const footer = document.getElementById('footer');
                    footer.innerHTML = "<td colspan='7'><table><tr><div style='text-align: center;'><img src='files/lose.png'></div></td></tr>"
                        + "<tr><td>&nbsp;</td></tr><tr><td colspan='7'><div style='text-align: center;'><img src='files/logo.png'></div></td></tr></table>";
                    this.reset('Game&nbsp;&nbsp;&nbsp;Over');
                });
            }
        });
    }

    _isEnemy(s) {
         if (s != null && s.texture != null && s.texture.key != null) {
             for (let t of this.enemyTextures) {
                 if (s.texture.key.startsWith(t)) {
                     return true;
                 }
             }
         }
         return false;
     }
}
