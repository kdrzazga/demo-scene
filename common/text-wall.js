
class TextWall {

    constructor(scene, options = {}) {
        this.scene = scene;

        // --- animation state --------------------------------------------
        this.progress = 0;                    // fractional line counter
        this.speed = options.speed || 20;     // lines revealed per second

        // --- content ----------------------------------------------------
        this.lines = options.lines || [];     // full source, one entry per line
        this.cursor = 0;                      // index of the next source line
        this.loop = options.loop !== false;   // restart when source runs out

        // --- layout -----------------------------------------------------
        this.x = options.x != null ? options.x : 16;
        this.y = options.y != null ? options.y : 12;
        this.rows = options.rows || 24;       // visible rows before scrolling
        this.visible = [];                    // lines currently on screen

        const style = Object.assign({
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#33ff66',
            lineSpacing: 4
        }, options.style || {});

        this.text = scene.add.text(this.x, this.y, '', style);
        this.text.setDepth(options.depth != null ? options.depth : 100);
    }

    /** Replace the source lines (e.g. after a text file finishes loading). */
    setLines(lines) {
        this.lines = lines || [];
        this.cursor = 0;
        return this;
    }

    /** Wipe the screen and rewind the animation to the start. */
    reset() {
        this.progress = 0;
        this.cursor = 0;
        this.visible = [];
        this.text.setText('');
        return this;
    }

    /**
     * Advance the animation. Call once per frame from Scene.update(), passing
     * the frame delta in milliseconds. Reveals as many whole lines as the
     * elapsed time allows, so it stays correct even on a stuttering frame.
     */
    write(delta) {
        if (this.lines.length === 0) return;

        this.progress += (delta / 1000) * this.speed;

        while (this.progress >= 1) {
            this.progress -= 1;
            const line = this._nextLine();
            if (line === null) { this.progress = 0; break; }   // source exhausted
            this._pushLine(line);
        }
    }

    /** Pull the next source line, looping (or stopping) at the end. */
    _nextLine() {
        if (this.cursor >= this.lines.length) {
            if (!this.loop) return null;
            this.cursor = 0;
        }
        return this.lines[this.cursor++];
    }

    /** Add one line at the bottom, scrolling the oldest line off when full. */
    _pushLine(line) {
        this.visible.push(line);
        if (this.visible.length > this.rows) {
            this.visible.shift();          // scroll: drop the top line
        }
        this.text.setText(this.visible.join('\n'));
    }
}
