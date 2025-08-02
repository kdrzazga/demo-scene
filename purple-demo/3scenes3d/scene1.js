class Scene1 extends DigDugScene {
    constructor() {
        super({ key: 'Scene1' });
        this.yPos = 0;
        this.digDugLeaving = false;
        this.musicPlaying = false;

        this.alphabet = null;
        this.demoCaption = null;
    }

    create(){

        this.alphabet = new Alphabet(this, '../../common/pics');
        //this.alphabet.scale = 0.3;
        this.createDemoCaption();
    }

    createDemoCaption(){
        if (this.demoCaption != undefined)
            return;

        this.demoCaption = this.alphabet.createCaption('rick astley', 15, 15, 0.5);
        this.alphabet.waveSinusoidally(this.demoCaption, 15);
    }
}
