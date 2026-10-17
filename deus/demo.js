class Demo {
    constructor({ music, transmission, musicVolume = 0.6, duckedVolume = 0.2, restartDelay = 60 }) {
        this.transmission = transmission;
        this.restartDelay = restartDelay;
        this.musicVolume = musicVolume;
        this.duckedVolume = duckedVolume;
        this.music = new Audio(music);
        this.music.loop = true;
        this.music.volume = musicVolume;
        this.startScreen = document.getElementById('start');
        this.stage = new Stage(document.getElementById('stage'));
        this.intro = new IntroLogo();
        this.island = new LibertyIsland();
        this.belt = new BeltView();
        this.inventory = new InventoryView({ bottomOffset: this.belt.margin + this.belt.height + 12 });
        this.stage.add(this.intro);
        document.getElementById('start-button').addEventListener('click', () => this.start());
        window.addEventListener('keydown', event => this.onKey(event));
    }

    onKey(event) {
        if (!this.stage.has(this.inventory)) return;
        if (event.key !== 'F1' && event.key.toLowerCase() !== 'i') return;
        event.preventDefault();
        this.inventory.toggle();
    }

    async start() {
        this.startScreen.hidden = true;
        this.listener ??= new AudioContext();
        await this.listener.resume();
        if (this.music.paused) this.music.play();
        await this.intro.leave();
        this.stage.remove(this.intro);
        this.island.restart();
        this.stage.add(this.island);
        this.showHud();
        await this.playTransmission();
        await this.wait(this.restartDelay);
        this.hideHud();
        this.island.stop();
        this.stage.remove(this.island);
        this.intro.restart();
        this.stage.add(this.intro);
        this.startScreen.hidden = false;
    }

    wait(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    showHud() {
        this.stage.add(this.belt);
        this.stage.add(this.inventory);
    }

    hideHud() {
        this.inventory.hide();
        this.stage.remove(this.belt);
        this.stage.remove(this.inventory);
    }

    async playTransmission() {
        const telecomm = new TelecommWindow({ ...this.transmission, listener: this.listener });
        this.stage.add(telecomm);
        this.music.volume = this.duckedVolume;
        await telecomm.play();
        this.music.volume = this.musicVolume;
        this.stage.remove(telecomm);
        telecomm.dispose();
    }
}
