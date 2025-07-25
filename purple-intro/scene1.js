class DigDugScene extends Phaser.Scene {

    preload() {
        this.load.image('dig-dug1', '../common/pics/dig-dug/dig-dug1.png');
        this.load.image('dig-dug2', '../common/pics/dig-dug/dig-dug2.png');
        this.load.image('dig-dug3', '../common/pics/dig-dug/dig-dug3.png');
    }
}

class Scene1 extends DigDugScene {
    constructor() {
        super({ key: 'Scene1' });
        this.yPos = 0;
        this.digDugLeaving = false;
        this.musicPlaying = false;
    }

    preload() {
        super.preload();
        this.load.image('loading', 'pics/loading.png');
        this.load.audio('backgroundMusic', 'music/Everlasting.mp3');
    }

    create() {
        this.digdug = SpriteManager.createDigDug(this, 852);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.sprite(400, 185, 'loading');
        this.music = this.sound.add('backgroundMusic');
        this.music.setLoop(true);
    }

    update(time, delta) {
        if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown){
            this.digDugLeaving = true;
            this.digdug.speed = 4;
            this.music.play();
            this.playing = true;
        }

        if (this.digDugLeaving){
                this.digdugLeave();
                return;
            }

        this.digdug.move();
    }

    digdugLeave(event){
        this.digdug.moveRight();

        if(this.digdug.sprite.x >= this.digdug.limitX)
            this.scene.start('Scene2');
    }

}
