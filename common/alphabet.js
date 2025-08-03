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

        const assets = ['a', 'b', 'c', 'd', 'e', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'y', 'z', 'space'];

        assets.forEach(asset => {
            this.scene.load.image(asset, `${directory}/alphabet/${asset}.png`);
        });
    }

    createCaption(text, xStart, yStart, distanceFactor=1){
        let spriteGroup = this.scene.add.group();
        const letters = text.split('');

        let previousLetterWidth = 0;
        for (let i = 0; i < letters.length;i ++) {
            let letter = letters[i];
            if (letter === ' ') letter = 'space';
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
