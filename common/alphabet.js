class Alphabet {

    constructor(scene){
        this.scene = scene;
        this.loadAlphabet()
    }

    loadAlphabet(){
        this.scene.load.image('a', '../common/pics/alphabet/a.png');
        this.scene.load.image('b', '../common/pics/alphabet/b.png');
        this.scene.load.image('c', '../common/pics/alphabet/c.png');
        this.scene.load.image('d', '../common/pics/alphabet/d.png');
        this.scene.load.image('e', '../common/pics/alphabet/e.png');

        this.scene.load.image('i', '../common/pics/alphabet/i.png');

        this.scene.load.image('m', '../common/pics/alphabet/m.png');

        this.scene.load.image('o', '../common/pics/alphabet/o.png');
        this.scene.load.image('p', '../common/pics/alphabet/p.png');
        this.scene.load.image('r', '../common/pics/alphabet/r.png');
        this.scene.load.image('u', '../common/pics/alphabet/u.png');

        this.scene.load.image('z', '../common/pics/alphabet/z.png');
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
            letterSprite.setScale(0.5);
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
