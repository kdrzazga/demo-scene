class KoalaEditorApp {
    constructor(document) {
        this.document = document;
        this.element = id => document.getElementById(id);
        this.koala = KoalaImage.blank();
        this.fileName = 'untitled.kla';
        this.modified = false;
        this.history = new EditHistory();
        this.palettes = C64Palette.all();
        this.view = new EditorView(this.element('canvas'), this.palettes[0]);
        this.colors = new ColorPanel(this.element('swatches'), this.element('primary'), this.element('secondary'),
            this.palettes[0], () => this.updateStatus());
        this.cellPanel = new CellPanel(this.element('cell'), this.palettes[0]);
        this.tools = [new PenTool(this), new LineTool(this), new FillTool(this), new PickerTool(this)];
        this.tool = this.tools[0];
        this.stroke = null;
        this.hover = null;
        this.message = '';
        this.drawScheduled = false;
        this.buildTools();
        this.buildSelects();
        this.bindControls();
        this.bindCanvas();
        this.bindKeys();
        this.dropZone = new DropZone(document.body, this.element('open'), this.element('file'), files => this.load(files[0]));
        window.addEventListener('beforeunload', event => {
            if (this.modified) event.preventDefault();
        });
        this.refreshAll();
    }

    get replaceOnClash() {
        return this.element('replace').checked;
    }

    buildTools() {
        const container = this.element('tools');
        this.tools.forEach(tool => {
            const button = document.createElement('button');
            button.textContent = `${tool.name} (${tool.key.toUpperCase()})`;
            button.addEventListener('click', () => this.selectTool(tool));
            tool.button = button;
            container.appendChild(button);
        });
    }

    buildSelects() {
        const paletteSelect = this.element('palette');
        this.palettes.forEach((palette, index) => paletteSelect.add(new Option(palette.name, index)));
        paletteSelect.addEventListener('change', () => this.setPalette(this.palettes[paletteSelect.value]));
        const backgroundSelect = this.element('background');
        C64Palette.NAMES.forEach((name, index) => backgroundSelect.add(new Option(`${index}: ${name}`, index)));
        backgroundSelect.addEventListener('change', () => this.setBackground(Number(backgroundSelect.value)));
    }

    bindControls() {
        this.element('new').addEventListener('click', () => this.newImage());
        this.element('save').addEventListener('click', () => this.save());
        this.element('undo').addEventListener('click', () => this.undo());
        this.element('redo').addEventListener('click', () => this.redo());
        this.element('swap').addEventListener('click', () => this.colors.swap());
        this.element('zoom-in').addEventListener('click', () => this.zoomBy(1));
        this.element('zoom-out').addEventListener('click', () => this.zoomBy(-1));
        this.element('pixel-grid').addEventListener('change', event => {
            this.view.showPixelGrid = event.target.checked;
            this.requestDraw();
        });
        this.element('cell-grid').addEventListener('change', event => {
            this.view.showCellGrid = event.target.checked;
            this.requestDraw();
        });
    }

    bindCanvas() {
        const canvas = this.view.canvas;
        canvas.addEventListener('contextmenu', event => event.preventDefault());
        canvas.addEventListener('mousedown', event => this.startStroke(event));
        window.addEventListener('mousemove', event => this.moveStroke(event));
        window.addEventListener('mouseup', event => this.endStroke(event));
        canvas.addEventListener('mouseleave', () => this.setHover(null));
        canvas.addEventListener('wheel', event => {
            if (!event.ctrlKey) return;
            event.preventDefault();
            this.zoomBy(event.deltaY < 0 ? 1 : -1);
        }, { passive: false });
    }

    bindKeys() {
        this.document.addEventListener('keydown', event => {
            if (event.target.tagName === 'SELECT' || event.target.tagName === 'INPUT') return;
            const key = event.key.toLowerCase();
            if (event.ctrlKey && key === 'z') this.consume(event, () => event.shiftKey ? this.redo() : this.undo());
            else if (event.ctrlKey && key === 'y') this.consume(event, () => this.redo());
            else if (event.ctrlKey && key === 's') this.consume(event, () => this.save());
            else if (event.ctrlKey && key === 'o') this.consume(event, () => this.element('file').click());
            else if (event.ctrlKey) return;
            else if (key === 'x') this.colors.swap();
            else if (key === 'g') this.toggle('cell-grid');
            else if (key === 'h') this.toggle('pixel-grid');
            else if (key === 'r') this.toggle('replace');
            else if (key === '+' || key === '=') this.zoomBy(1);
            else if (key === '-') this.zoomBy(-1);
            else if (/^Digit[0-9]$/.test(event.code)) {
                this.colors.select(event.shiftKey ? ColorPanel.SECONDARY : ColorPanel.PRIMARY, Number(event.code.slice(5)));
            } else {
                const tool = this.tools.find(candidate => candidate.key === key);
                if (tool) this.selectTool(tool);
            }
        });
    }

    consume(event, action) {
        event.preventDefault();
        action();
    }

    toggle(id) {
        const checkbox = this.element(id);
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
        this.updateStatus();
    }

    selectTool(tool) {
        this.tool = tool;
        this.tools.forEach(candidate => candidate.button.classList.toggle('active', candidate === tool));
        this.updateStatus();
    }

    startStroke(event) {
        if (event.button !== 0 && event.button !== 2) return;
        event.preventDefault();
        const button = event.button === 0 ? ColorPanel.PRIMARY : ColorPanel.SECONDARY;
        const tool = event.altKey ? this.tools.find(candidate => candidate instanceof PickerTool) : this.tool;
        this.history.record(this.koala);
        this.stroke = { button, tool, changed: false, clashes: 0 };
        tool.down(this.view.pixelAt(event), this.colors.color(button), button);
        this.requestDraw();
    }

    moveStroke(event) {
        const point = this.view.pixelAt(event);
        if (event.target === this.view.canvas) this.setHover(point);
        if (!this.stroke) return;
        if (this.stroke.tool instanceof LineTool) {
            this.stroke.changed = false;
            this.stroke.clashes = 0;
        }
        this.stroke.tool.move(point, this.colors.color(this.stroke.button), this.stroke.button);
        this.requestDraw();
    }

    endStroke(event) {
        if (!this.stroke) return;
        this.stroke.tool.up(this.view.pixelAt(event), this.colors.color(this.stroke.button), this.stroke.button);
        if (this.stroke.changed) this.modified = true;
        else this.history.discardLast();
        this.message = this.stroke.clashes > 0
            ? `${this.stroke.clashes} pixel(s) blocked: cell already has 3 colors + background (R toggles replace mode)`
            : '';
        this.stroke = null;
        this.refreshAll();
    }

    setHover(point) {
        this.hover = point && KoalaImage.contains(point.x, point.y) ? point : null;
        this.view.hoverCell = this.hover ? KoalaImage.cellAt(this.hover.x, this.hover.y) : null;
        this.cellPanel.show(this.koala, this.view.hoverCell);
        this.updateStatus();
        this.requestDraw();
    }

    paint(x, y, color) {
        const result = this.koala.paint(x, y, color, this.replaceOnClash);
        if (!this.stroke) return result;
        if (result === KoalaImage.PAINT_DONE || result === KoalaImage.PAINT_REPLACED) this.stroke.changed = true;
        if (result === KoalaImage.PAINT_CLASH) {
            this.stroke.clashes++;
            this.view.flash(KoalaImage.cellAt(x, y));
        }
        return result;
    }

    setBackground(color) {
        if (color === this.koala.background) return;
        this.history.record(this.koala);
        this.koala.background = color;
        this.modified = true;
        this.refreshAll();
    }

    setPalette(palette) {
        this.view.palette = palette;
        this.colors.setPalette(palette);
        this.cellPanel.setPalette(palette);
        this.refreshAll();
    }

    zoomBy(step) {
        this.view.setZoom(this.view.zoom + step);
        this.refreshAll();
    }

    undo() {
        this.restore(this.history.undo(this.koala));
    }

    redo() {
        this.restore(this.history.redo(this.koala));
    }

    restore(koala) {
        if (!koala) return;
        this.koala = koala;
        this.modified = true;
        this.refreshAll();
    }

    confirmDiscard() {
        return !this.modified || window.confirm('Discard unsaved changes?');
    }

    newImage() {
        if (!this.confirmDiscard()) return;
        this.koala = KoalaImage.blank();
        this.fileName = 'untitled.kla';
        this.history = new EditHistory();
        this.modified = false;
        this.message = 'New image';
        this.refreshAll();
    }

    async load(file) {
        if (!this.confirmDiscard()) return;
        try {
            this.koala = KoalaImage.fromBytes(new Uint8Array(await file.arrayBuffer()));
            this.fileName = file.name.replace(/\.[^.]*$/, '') + '.kla';
            this.history = new EditHistory();
            this.modified = false;
            this.message = `Loaded ${file.name} (${file.size} bytes)`;
        } catch (error) {
            this.message = `${file.name}: ${error.message}`;
        }
        this.element('file').value = '';
        this.refreshAll();
    }

    save() {
        const blob = new Blob([this.koala.toBytes()], { type: 'application/octet-stream' });
        const link = this.document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.fileName;
        link.click();
        URL.revokeObjectURL(link.href);
        this.modified = false;
        this.message = `Saved ${this.fileName}`;
        this.updateStatus();
    }

    refreshAll() {
        this.element('background').value = this.koala.background;
        this.element('zoom').textContent = `${this.view.zoom}x`;
        this.document.title = `${this.modified ? '* ' : ''}${this.fileName} - Koala Editor`;
        this.tools.forEach(candidate => candidate.button.classList.toggle('active', candidate === this.tool));
        this.cellPanel.show(this.koala, this.view.hoverCell);
        this.updateStatus();
        this.requestDraw();
    }

    updateStatus() {
        const parts = [`${this.modified ? '* ' : ''}${this.fileName}`, this.tool.name,
            this.replaceOnClash ? 'clash: replace' : 'clash: block'];
        if (this.hover) {
            const color = this.koala.colorAt(this.hover.x, this.hover.y);
            parts.push(`pixel (${this.hover.x},${this.hover.y}) is ${C64Palette.colorName(color)}, ${color}`);
        }
        if (this.message) parts.push(this.message);
        this.element('status').textContent = parts.join(' - ');
    }

    requestDraw() {
        if (this.drawScheduled) return;
        this.drawScheduled = true;
        requestAnimationFrame(() => {
            this.drawScheduled = false;
            this.view.draw(this.koala);
            if (this.view.hasFlashes()) this.requestDraw();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => new KoalaEditorApp(document));
