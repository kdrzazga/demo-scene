const maxWidth = 640;
const maxHeight = 640;

class MandelbrotScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MandelbrotScene' });
        this.xMin = -2.0;
        this.xMax = 1.0;
        this.yMin = -1.0;
        this.yMax = 1.0;
        this.width = maxWidth;
        this.height = maxHeight;
        this.maxIter = 100;
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics();
        this.drawMandelbrot();
    }

    getMandelParamsFromUi() {
        const iterationsSlider = document.getElementById('iterationSliderM');
        const iterations = parseInt(iterationsSlider.value, 10);
        this.maxIter = iterations;
        this.drawMandelbrot();
    }

    drawMandelbrot() {
        const pixelWidth = 1;
        this.graphics.clear();

        for (let px = 0; px < this.width; px++) {
            for (let py = 0; py < this.height; py++) {
                let x0 = this.xMin + (px / this.width) * (this.xMax - this.xMin);
                let y0 = this.yMin + (py / this.height) * (this.yMax - this.yMin);
                let x = 0, y = 0;
                let iteration = 0;

                while (x * x + y * y <= 4 && iteration < this.maxIter) {
                    let xtemp = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = xtemp;
                    iteration++;
                }

                const colorValue = (iteration === this.maxIter) ? 0 : (iteration / this.maxIter) * 255;
                const color = Phaser.Display.Color.GetColor(colorValue, 0, colorValue);

                this.graphics.fillStyle(color, 1);
                this.graphics.fillRect(px * pixelWidth, py * pixelWidth, pixelWidth, pixelWidth);
            }
        }
    }

    update() {
    }
}

function getMandelParamsFromUi() {
    const scene = game.scene.getScene('MandelbrotScene');
    if (scene) {
        scene.getMandelParamsFromUi();
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'mandelbrot',
    width: maxWidth,
    height: maxHeight,
    backgroundColor: '#000000',
    scene: MandelbrotScene
};

const game = new Phaser.Game(config);

