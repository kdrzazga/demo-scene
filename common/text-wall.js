
class TextWall {

    constructor(scene, options = {}) {
        this.scene = scene;

        // Screen height at which the very first line is typed. From there the
        // wall fills downward and, once it reaches the bottom, scrolls up as
        // usual. Anchored relative to this.y (see the padding logic below).
        this.initial_screen_y = options.initial_screen_y != null ? options.initial_screen_y : 0;

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

        // The text object is anchored at this.y. To make the first line appear
        // at `initial_screen_y` we pad the top of the buffer with that many
        // blank lines, so line #1 renders at this.y + pad * lineStep. Those
        // blanks are the first to scroll off once the wall fills, giving the
        // "start low, fill down, then rise as usual" motion.
        this._lineStep = this._measureLineStep(style);
        const pad = Math.round((this.initial_screen_y - this.y) / this._lineStep);
        this._padLines = Math.max(0, Math.min(pad, this.rows - 1));
        this.visible = this._freshBuffer();
    }

    /** A fresh visible buffer seeded with the top-padding blank lines. */
    _freshBuffer() {
        return new Array(this._padLines).fill('');
    }

    /** Measure the pixel step between consecutive lines for the given style. */
    _measureLineStep(style) {
        const probe = this.scene.add.text(0, 0, 'X', style).setVisible(false);
        const oneLine = probe.height;
        probe.setText('X\nX');
        const step = probe.height - oneLine;
        probe.destroy();
        if (step > 0) return step;
        const fontSize = parseInt(style.fontSize, 10) || 18;   // fallback
        return fontSize + (style.lineSpacing || 0);
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
        this.visible = this._freshBuffer();
        this.text.setText(this.visible.join('\n'));
        return this;
    }

    /**
     * Advance the typing clock and return the whole lines revealed this frame,
     * WITHOUT rendering them. Reveals as many lines as the elapsed time allows,
     * so it stays correct even on a stuttering frame. TextWallArray uses this to
     * feed a shared scroll buffer; standalone callers use write() instead.
     */
    tick(delta) {
        if (this.lines.length === 0) return [];

        this.progress += (delta / 1000) * this.speed;

        const revealed = [];
        while (this.progress >= 1) {
            this.progress -= 1;
            const line = this._nextLine();
            if (line === null) { this.progress = 0; break; }   // source exhausted
            revealed.push(line);
        }
        return revealed;
    }

    /**
     * Standalone animation step: reveal lines for this frame and render them
     * into this wall's own text object. Call once per frame from Scene.update()
     * with the frame delta in ms. (When a wall is managed by a TextWallArray,
     * the array drives it via tick() instead and this is not used.)
     */
    write(delta) {
        const revealed = this.tick(delta);
        for (const line of revealed) {
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

    /** True once a non-looping wall has emitted all of its source lines. */
    isFinished() {
        return !this.loop && this.lines.length > 0 && this.cursor >= this.lines.length;
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


/**
 * TextWallArray — plays several TextWalls one after another into a single,
 * shared, continuously scrolling column, so they MERGE instead of replacing
 * one another.
 *
 * A wall types until it finishes all of its lines (isFinished()); then, after a
 * pause, the next wall picks up right where it left off. The previous wall's
 * text does not vanish — as the next wall adds lines at the bottom, the earlier
 * text is pushed up and scrolls off the top. Each wall keeps its own colour, so
 * you see one text stream flow into the next.
 *
 * `intervals[i]` is how long (ms) to wait before wall `i` starts, measured from
 * the moment the previous wall ENDED. intervals[0] is the wait before the very
 * first wall (use 0 to start at once).
 *
 *     const walls = new TextWallArray();
 *     walls.add(wallA, 0);        // starts right away
 *     walls.add(wallB, 500);      // 500 ms after wallA ends, continues from it
 *     // in Scene.update(time, delta):
 *     walls.update(delta);
 *     walls.draw();
 *
 * The shared column's geometry (position, row count, line height, and the first
 * wall's initial_screen_y padding) is taken from the FIRST wall. Every wall must
 * be finite (loop: false); a looping wall never ends and would stall the queue.
 */
class TextWallArray {

    constructor() {
        this.wallArrays = [];        // the TextWall instances, in play order
        this.intervals = [];         // ms to wait before each wall (see above)

        this._index = 0;             // wall currently animating (or waiting for)
        this._phase = 'waiting';     // 'waiting' | 'animating' | 'done'
        this._waitRemaining = 0;     // ms left before the current wall starts
        this._started = false;       // has the schedule been primed yet?

        // Shared scroll buffer of the last `rows` lines, each tagged with the
        // wall that produced it (newest last). Because walls play in order, a
        // wall's lines always form one contiguous run in here.
        this.buffer = [];
    }

    /** Register a wall together with the delay (ms) before it starts. */
    add(wall, interval = 0) {
        this.wallArrays.push(wall);
        this.intervals.push(interval);
        return this;
    }

    // Shared column layout, borrowed from the first wall.
    get _bandTop()  { return this.wallArrays[0].y; }
    get _rows()     { return this.wallArrays[0].rows; }
    get _lineStep() { return this.wallArrays[0]._lineStep; }

    /** Append a produced line to the shared buffer, scrolling the top off. */
    _addLine(text, wallIndex) {
        this.buffer.push({ text: text, wall: wallIndex });
        if (this.buffer.length > this._rows) {
            this.buffer.shift();     // scroll the column up by one line
        }
    }

    /**
     * Advance the sequence into the shared buffer. Runs the current wall; once
     * it finishes, waits intervals[next] ms and moves to the next wall, which
     * keeps appending to the same column. Pass Phaser's frame delta (ms); if
     * omitted it is read from the scene's game loop.
     */
    update(delta) {
        if (this.wallArrays.length === 0) return;

        if (delta == null) {
            const scene = this.wallArrays[0].scene;
            delta = scene ? scene.game.loop.delta : 16;
        }

        if (!this._started) {
            this._started = true;
            this._index = 0;
            this._waitRemaining = this.intervals[0] || 0;
            this._phase = this._waitRemaining > 0 ? 'waiting' : 'animating';
            // Seed the first wall's initial_screen_y padding as blank lines so
            // its first line lands at initial_screen_y before scrolling up.
            const pad = this.wallArrays[0]._padLines || 0;
            for (let i = 0; i < pad; i++) this._addLine('', 0);
        }

        if (this._phase === 'done') return;

        if (this._phase === 'waiting') {
            this._waitRemaining -= delta;
            if (this._waitRemaining > 0) return;   // still counting down
            this._phase = 'animating';             // fall through to animate
        }

        if (this._phase === 'animating') {
            const wall = this.wallArrays[this._index];
            const revealed = wall.tick(delta);     // new lines this frame
            for (const line of revealed) {
                this._addLine(line, this._index);
            }

            if (wall.isFinished()) {
                if (this._index + 1 < this.wallArrays.length) {
                    this._index += 1;
                    this._waitRemaining = this.intervals[this._index] || 0;
                    this._phase = this._waitRemaining > 0 ? 'waiting' : 'animating';
                } else {
                    this._phase = 'done';
                }
            }
        }
    }

    /**
     * Render the shared column. Each wall draws the contiguous run of lines it
     * owns, in its own colour, stacked top-to-bottom in play order — so the
     * previous wall's text sits above the current wall's and scrolls up and off
     * as the current wall fills in below.
     */
    draw() {
        const bandTop = this._bandTop;
        const step = this._lineStep;

        let offset = 0;   // rows already used by earlier walls, from the top
        for (let w = 0; w < this.wallArrays.length; w++) {
            const wall = this.wallArrays[w];
            if (!wall.text) continue;

            const slice = [];
            for (const item of this.buffer) {
                if (item.wall === w) slice.push(item.text);
            }

            if (slice.length === 0) {
                wall.text.setVisible(false);       // this wall has scrolled away
                continue;
            }

            wall.text.setVisible(true);
            wall.text.setText(slice.join('\n'));
            wall.text.y = bandTop + offset * step;
            offset += slice.length;
        }
    }

    /** Rewind the sequence, the shared buffer, and every wall to the start. */
    reset() {
        this._started = false;
        this._index = 0;
        this._phase = 'waiting';
        this._waitRemaining = 0;
        this.buffer = [];
        this.wallArrays.forEach(wall => wall.reset());
        return this;
    }
}
