class HudPanel {
    constructor({
        panelWidth,
        panelHeight,
        font = 'Arial, Helvetica, sans-serif',
        envelopeColor = '#e4e9ec',
        envelopeWidth = 2,
        envelopeGap = 4,
        cornerCut = 10,
        pixelRatio = 2,
    }) {
        this.panelWidth = panelWidth;
        this.panelHeight = panelHeight;
        this.font = font;
        this.envelopeColor = envelopeColor;
        this.envelopeWidth = envelopeWidth;
        this.cornerCut = cornerCut;
        this.pixelRatio = pixelRatio;
        this.inset = envelopeWidth + envelopeGap;
        this.width = panelWidth + this.inset * 2;
        this.height = panelHeight + this.inset * 2;

        this.group = new THREE.Group();
        this.createMesh();
    }

    createMesh() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.context = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = false;
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.width, this.height),
            new THREE.MeshBasicMaterial({ map: this.texture, transparent: true })
        );
        this.group.add(this.mesh);
    }

    draw() {
        const c = this.context;
        c.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        c.clearRect(0, 0, this.width, this.height);
        this.drawEnvelope(c);
        c.translate(this.inset, this.inset);
        this.drawPanel(c);
        this.drawContent(c);
        this.texture.needsUpdate = true;
    }

    drawContent() {
    }

    chamfer(c, x, y, w, h, cut) {
        c.beginPath();
        c.moveTo(x + cut, y);
        c.lineTo(x + w, y);
        c.lineTo(x + w, y + h - cut);
        c.lineTo(x + w - cut, y + h);
        c.lineTo(x, y + h);
        c.lineTo(x, y + cut);
        c.closePath();
    }

    drawEnvelope(c) {
        const half = this.envelopeWidth / 2;
        this.chamfer(c, half, half, this.width - this.envelopeWidth, this.height - this.envelopeWidth, this.cornerCut + this.inset);
        c.lineWidth = this.envelopeWidth;
        c.strokeStyle = this.envelopeColor;
        c.stroke();
    }

    drawPanel(c) {
        const gradient = c.createLinearGradient(0, 0, 0, this.panelHeight);
        gradient.addColorStop(0, 'rgba(34, 46, 56, 0.85)');
        gradient.addColorStop(1, 'rgba(10, 16, 22, 0.85)');
        this.chamfer(c, 1, 1, this.panelWidth - 2, this.panelHeight - 2, this.cornerCut);
        c.fillStyle = gradient;
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = '#8fa1ad';
        c.stroke();
    }

    drawSlot(c, x, y, w, h) {
        c.fillStyle = 'rgba(0, 0, 0, 0.55)';
        c.fillRect(x, y, w, h);
        c.lineWidth = 1;
        c.strokeStyle = '#05080b';
        c.beginPath();
        c.moveTo(x + 0.5, y + h);
        c.lineTo(x + 0.5, y + 0.5);
        c.lineTo(x + w, y + 0.5);
        c.stroke();
        c.strokeStyle = 'rgba(169, 184, 194, 0.7)';
        c.beginPath();
        c.moveTo(x + w - 0.5, y);
        c.lineTo(x + w - 0.5, y + h - 0.5);
        c.lineTo(x, y + h - 0.5);
        c.stroke();
    }

    drawStrip(c, x, y, w, h, highlighted = false) {
        c.fillStyle = highlighted ? 'rgba(143, 161, 173, 0.35)' : 'rgba(0, 0, 0, 0.4)';
        c.fillRect(x, y, w, h);
        c.lineWidth = 1;
        c.strokeStyle = highlighted ? '#cfdbe2' : 'rgba(143, 161, 173, 0.6)';
        c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    drawLabel(c, text, x, y, { size = 12, bold = false, align = 'left', baseline = 'middle', color = '#e6eef3', spacing = 0 } = {}) {
        c.font = `${bold ? 'bold ' : ''}${size}px ${this.font}`;
        c.textAlign = align;
        c.textBaseline = baseline;
        c.fillStyle = color;
        c.letterSpacing = `${spacing}px`;
        c.fillText(text, x, y);
        c.letterSpacing = '0px';
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.texture.dispose();
    }
}
