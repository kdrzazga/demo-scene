class DizzyGlobals {

    static PLAYER_SPEED = 13;

    static FLOOR_LEVELS_1 = [
                       { range: [0, 120], level: 419 },
                       { range: [121, 152], level: 415 },
                       { range: [152, 200], level: 411 },
                       { range: [201, 250], level: 405 },
                       { range: [251, 310], level: 410 },
                       { range: [311, 440], level: 402 },
                       { range: [441, Infinity], level: 409 }
                   ];

    static FLOOR_LEVELS_67 = [
                        { range: [-Infinity, 120], level: 431 },
                        { range: [121, 150], level: 439 },
                        { range: [151, 270], level: 446 },
                        { range: [238, Infinity], level: 425 }
                    ];
}

const Direction = Object.freeze({
    LEFT: 'left',
    RIGHT: 'right',
	UP: 'up',
	DOWN: 'down'
});

class Sprite {
    constructor(canvas, x, y) {
        this.speed = DizzyGlobals.PLAYER_SPEED;
        this.hp = 4;
        this.x = x;
        this.y = y;
        this.name = "sprite";
        this.canvas = canvas;
        this.picLeftPath = "";
        this.picLeftStepPath = "";
        this.picRightPath = "";
        this.picRightStepPath = "";
        this.picPath = "";
        this.direction = Direction.RIGHT;
        this.animationIntervalId = null;
        this.animationFrames = [];
        this.currentFrameIndex = 0;
        this.isAnimating = false;
        this.animationDelay = 500;
    }

    moveRight() {
        if (this.hp > 0) {
            this.x += this.speed;
            this.direction = Direction.RIGHT;

            const currentTime = performance.now();
                    if (currentTime % 400 < 200) {
                        this.picPath = this.picRightPath;
                    } else {
                        this.picPath = this.picRightStepPath;
                    }
        }
    }

    moveLeft() {
        if (this.hp > 0) {
            this.x -= this.speed;
            this.direction = Direction.LEFT;
            const currentTime = performance.now();
                    if (currentTime % 400 < 200) {
                        this.picPath = this.picLeftPath;
                    } else {
                        this.picPath = this.picLeftStepPath;
                    }
        }
    }

    draw() {
        let context = this.canvas.getContext('2d');
        let pictureLoader = new PictureLoader(context);
        pictureLoader.load(this.picPath, this.x, this.y);
    }

    collide(anotherSprite) {
        if (anotherSprite.hp <= 0) {
            console.warn('No collision with dead enemy');
            return false;
        }
        const collisionDistanceVert = 35;
        const collisionDistanceHoriz = 14;
        return Math.abs(this.x - anotherSprite.x) < collisionDistanceHoriz &&
               Math.abs(this.y - anotherSprite.y) < collisionDistanceVert;
    }

    revive(timeout) {
        if (this.hp > 0) {
            console.warn(`Sprite ${this.name} is alive. No need to revive.`);
            return;
        }
        this.x = 300;
        this.y = 200;
        setTimeout(() => {
            this.hp = 4;
        }, timeout);
    }

    startAnimation(picPathsArray) {
        if (this.isAnimating) {
            this.stopAnimation();
        }
        this.animationFrames = picPathsArray;
        this.currentFrameIndex = 0;
        this.isAnimating = true;
        this.animationIntervalId = setInterval(() => {
            if (this.animationFrames.length === 0) return;
            this.picPath = this.animationFrames[this.currentFrameIndex];
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.animationFrames.length;
        }, this.animationDelay);
    }

    stopAnimation() {
        if (this.animationIntervalId) {
            clearInterval(this.animationIntervalId);
            this.animationIntervalId = null;
            this.isAnimating = false;
        }
    }
}

class Player extends Sprite{

	checkIfDead(){
		if (this.hp <= 0){
			console.log(this.name + " is dead.\n\n\n");

			let context = this.canvas.getContext('2d');
			let pictureLoader = new PictureLoader(context);
			pictureLoader.load('gameover.png', 8 * C64Blackbox.rowHeight, 4.75 * C64Blackbox.rowHeight);
			C64Blackbox.texture.needsUpdate = true;

			setTimeout(() => {
				location.reload();
			}, 4000);
		}
	}
}

class PictureLoader {
    constructor(context) {
        this.context = context;
        this.textureLoader = new THREE.TextureLoader();
        this.fileName = "";
        this.texture = null;
    }

    load(fileName, x, y) {
        this.fileName = fileName;
        this.read().then(texture => {
            this.texture = texture;
            this.draw(x, y);
        }).catch(error => {
            console.error('Failed to load picture:', error);
        });
    }

    read() {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                this.fileName,
                (texture) => {
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error('An error occurred while loading the texture:', error);
                    reject(error);
                }
            );
        });
    }

    draw(x, y) {
        const { canvas } = this.context;
        const tmpCanvas = document.createElement('canvas');
        const tmpCtx = tmpCanvas.getContext('2d');

        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;

        tmpCtx.drawImage(canvas, 0, 0);
        if (this.texture) {
            tmpCtx.drawImage(this.texture.image, x, y);
        }

        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.context.drawImage(tmpCanvas, 0, 0);
    }
}
