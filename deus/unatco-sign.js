class UnatcoSign extends WallDecal {
    constructor({ size = [1.6, 1.0], ...options } = {}) {
        super({ width: size[0], height: size[1], ...options });
    }

    source() {
        return this.paint();
    }

    paint() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 320;
        const c = canvas.getContext('2d');
        c.fillStyle = '#5a5e66';
        c.fillRect(0, 0, 512, 320);
        c.fillStyle = '#eceef0';
        c.fillRect(14, 14, 484, 292);
        c.fillStyle = '#9e1b1b';
        c.fillRect(30, 30, 452, 80);
        c.fillStyle = '#1d3f8a';
        c.beginPath();
        c.arc(78, 70, 32, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#d8c060';
        c.lineWidth = 3;
        c.stroke();
        this.drawStar(c, 78, 70, 16, 7);
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillStyle = '#f2f2f2';
        c.font = 'bold 52px "Times New Roman", Georgia, serif';
        c.fillText('U.N.A.T.C.O.', 290, 72);
        c.fillStyle = '#141414';
        c.font = '62px Arial, Helvetica, sans-serif';
        c.fillText('Personnel', 256, 170);
        c.fillStyle = '#9e1b1b';
        c.font = '900 76px "Arial Black", Arial, sans-serif';
        c.fillText('ONLY', 256, 252);
        return canvas;
    }

    drawStar(c, x, y, outer, inner) {
        c.fillStyle = '#d8c060';
        c.beginPath();
        for (let point = 0; point < 10; point++) {
            const radius = point % 2 === 0 ? outer : inner;
            const angle = -Math.PI / 2 + point * Math.PI / 5;
            c.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        }
        c.closePath();
        c.fill();
    }
}
