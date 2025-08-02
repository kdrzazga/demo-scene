class Alphabet {

    constructor(scene, directory){
        this.scene = scene;
        if (directory)
            this.directory = directory;
        this.scale = 0.5;
        this.loadAlphabet()
    }

    loadAlphabet(){

        const directory = this.directory ? this.directory : ''

        this.scene.load.image('a', directory + '/alphabet/a.png');
        this.scene.load.image('b', directory + '/alphabet/b.png');
        this.scene.load.image('c', directory + '/alphabet/c.png');
        this.scene.load.image('d', directory + '/alphabet/d.png');
        this.scene.load.image('e', directory + '/alphabet/e.png');

        this.scene.load.image('i', directory + '/alphabet/i.png');

        this.scene.load.image('m', directory + '/alphabet/m.png');
        this.scene.load.image('n', directory + '/alphabet/n.png');

        this.scene.load.image('o', directory + '/alphabet/o.png');
        this.scene.load.image('p', directory + '/alphabet/p.png');
        this.scene.load.image('r', directory + '/alphabet/r.png');
        this.scene.load.image('s', directory + '/alphabet/s.png');
        this.scene.load.image('u', directory + '/alphabet/u.png');

        this.scene.load.image('z', directory + '/alphabet/z.png');
    }

    createCaption(text, xStart, yStart, distanceFactor=1){
        let spriteGroup = this.scene.add.group();
        const letters = text.split('');

        let previousLetterWidth = 0;
        for (let i = 0; i < letters.length;i ++) {
            const letter = letters[i];
            const texture = this.scene.textures.get(letter);
            xStart += previousLetterWidth * distanceFactor;
            let letterSprite = this.scene.add.sprite(xStart, yStart, texture);
            letterSprite.setScale(this.scale);
            spriteGroup.add(letterSprite);
            previousLetterWidth = texture.getSourceImage().width;
        }

        return spriteGroup;
    }

    waveSinusoidally(spriteGroup, amplitude) {
        const speed = 0.05;
        const startTime = this.scene.time.now;

        this.scene.tweens.add({
            targets: spriteGroup.getChildren(),
            y: (sprite) => {
                const timeElapsed = this.scene.time.now - startTime;
                const sineValue = Math.sin(timeElapsed * speed + sprite.x * 0.1);
                return sprite.y + (sineValue * amplitude);
            },
            duration: 1000,
            repeat: -1,
            yoyo: true
        });
    }
}
