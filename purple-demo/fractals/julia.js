
class JuliaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JuliaScene' });
        this.xMin = -2.0;
        this.xMax = 2.0;
        this.yMin = -2.0;
        this.yMax = 2.0;
        this.width = maxWidth;
        this.height = maxHeight;
        this.maxIter = 100;
        this.cRe = -0.7;
        this.cIm = 0.27015;
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics();
        this.drawJulia();
    }

    getJuliaParamsFromUi() {
        const iterationsSlider = document.getElementById('iterationSliderJ');
        const iterations = parseInt(iterationsSlider.value, 10);
        this.maxIter = iterations;

        const cReInput = document.getElementById('cReInput');
        const cImInput = document.getElementById('cImInput');
        this.cRe = parseFloat(cReInput.value);
        this.cIm = parseFloat(cImInput.value);

        this.updateLabels();

        this.drawJulia();
    }

    updateLabels(){
        const cReDiv = document.getElementById('julia-re');
        const cImDiv = document.getElementById('julia-im');
        const iterationsDiv = document.getElementById('julia-max');

        cReDiv.innerText = this.cRe;
        cImDiv.innerText = this.cIm;
        iterationsDiv.innerText = this.maxIter;
    }

    drawJulia() {
        const pixelWidth = 1;
        this.graphics.clear();

        for (let px = 0; px < this.width; px++) {
            for (let py = 0; py < this.height; py++) {
                let x0 = this.xMin + (px / this.width) * (this.xMax - this.xMin);
                let y0 = this.yMin + (py / this.height) * (this.yMax - this.yMin);
                let x = x0, y = y0;
                let iteration = 0;

                while (x * x + y * y <= 4 && iteration < this.maxIter) {
                    let xtemp = x * x - y * y + this.cRe;
                    y = 2 * x * y + this.cIm;
                    x = xtemp;
                    iteration++;
                }

                let colorValue = (iteration === this.maxIter) ? 0 : (iteration / this.maxIter) * 100;
                colorValue = (
                    1.2 * Math.pow(10, -6) * Math.pow(colorValue, 4) -
                    0.0001 * Math.pow(colorValue, 3) +
                    0.005 * Math.pow(colorValue, 2) +
                    0.1 * colorValue +
                    1.5
                );

                colorValue = 2.52 * colorValue;
                const color = Phaser.Display.Color.GetColor(colorValue, 0, colorValue);

                this.graphics.fillStyle(color, 1);
                this.graphics.fillRect(px * pixelWidth, py * pixelWidth, pixelWidth, pixelWidth);
            }
        }
    }

    update() {
    }
}

function getJuliaParamsFromUi() {
    const scene = julia.scene.getScene('JuliaScene');
    if (scene) {
        scene.getJuliaParamsFromUi();
    }
}

const juliaConfig = {
    type: Phaser.AUTO,
    parent: 'julia',
    width: maxWidth,
    height: maxHeight,
    backgroundColor: '#000000',
    scene: JuliaScene
};

const julia = new Phaser.Game(juliaConfig);
