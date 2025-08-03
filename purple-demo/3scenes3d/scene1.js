class Scene1 extends DigDugScene {
    constructor() {
        super({ key: 'Scene1' });
        this.yPos = 0;
        this.digDugLeaving = false;
        this.musicPlaying = false;

        this.alphabet = null;
        this.demoCaption = null;
    }

    preload(){
        this.alphabet = new Alphabet(this, 'http://localhost:63342/demo-scene/common/pics');
    }

    create(){
        this.createDemoCaption();
    }

    createDemoCaption(){
        if (this.demoCaption != undefined)
            return;

        this.alphabet.scale = 0.18;
        this.demoCaption = this.alphabet.createCaption('rick astley', 15, 15, 0.5);
        this.alphabet.waveSinusoidally(this.demoCaption, 15);
    }
}
