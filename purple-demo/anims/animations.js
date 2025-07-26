class AnimatedContentLoader {
    constructor(animationParams) {
        this.filesToLoad = animationParams.filesToLoad;
        this.animationSequence = animationParams.animationSequence;
        this.delay = animationParams.delay;
        this.duration = animationParams.duration;
        this.fileContents = [];
        this.contentIndex = 0;
        this.intervalPointer = null;

        this.preloadContent();
    }

    async preloadContent() {
        const uniqueFiles = [...new Set(this.filesToLoad)];
        try {
            const contents = await Promise.all(uniqueFiles.map(file => fetch(file).then(response => response.text())));
            this.fileContents = contents;
            this.startAnimation();
        } catch (error) {
            document.getElementById('content').innerHTML = 'Error loading content.';
        }
    }

    startAnimation() {
        const changeContent = () => {
            document.getElementById('content').innerHTML = this.fileContents[this.animationSequence[this.contentIndex]];
            this.contentIndex = (this.contentIndex + 1) % this.animationSequence.length;
        };

        this.intervalPointer = setInterval(changeContent, this.delay);
        this.checkDuration();
    }

    stopAnimation() {
        clearInterval(this.intervalPointer);
    }

    checkDuration() {
        setTimeout(() => {
            this.stopAnimation();
            console.log(`Animation stopped after ${this.duration} milliseconds`);
        }, this.duration);
    }
}

const anim1Params = {
    filesToLoad: ['k1.html', 'k2.html', 'k3.html', 'k4.html'],
    animationSequence: [0, 1, 2, 0, 1, 2, 3],
    delay: 110,
    duration: 7500
};

const anim2Params = {
    filesToLoad: ['b1.html', 'b2.html'],
    animationSequence: [0, 1],
    delay: 110,
    duration: 7200
};

const anim3Params = {
    filesToLoad: ['d1.html', 'd2.html'],
    animationSequence: [0, 1],
    delay: 110,
    duration: 6600
};

function animationCycle(){
	let a1 = new AnimatedContentLoader(anim1Params);

	setTimeout(() => {
	    const a2 = new AnimatedContentLoader(anim2Params);
	    setTimeout(() => {
	        const a3 = new AnimatedContentLoader(anim3Params);
	    }, a2.duration);
	}, a1.duration);
}
